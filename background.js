import * as events from "/events.js";
import * as status from "/status.js";

/**
 * TACBCommand base class.
 *
 * @abstract
 */
class TACBCommand {
    /**
     * @param {TACBackend} backend
     */
    constructor(backend) {
        this.backend = backend;
    }

    /**
     * @param {any} evt
     *
     * @return {T}
     */
    async execute(evt) {}
}

/**
 * ListAccounts provides a listing of existing nsIMsgAccounts.
 */
class ListAccounts extends TACBCommand {
    async execute(evt) {
        return messenger.accounts.list(false);
    }
}

/**
 * CopyMsgFilters attempts to copy message filters from one account to another.
 */
class CopyMsgFilters extends TACBCommand {
    /**
     * getConflicts builds a list of filter references that from the source
     * list that seem to appear in the destination list.
     *
     * @param {FilteRef[]} src
     * @param {FilterRef[]} dest
     *
     * @return {FilterRef[]}
     */
    getConflicts(src, dest) {
        return src.filter(target =>
            dest.find(
                filter =>
                    target.name === filter.name &&
                    target.description === filter.description &&
                    target.searchTerms.join() === target.searchTerms.join()
            )
        );
    }

    /**
     * @typedef {Object} CopyResult
     *
     * @property {string} type      - "message-filters"
     * @property {number} status    - 0=aborted, 1=complete -1=error
     * @property {number} count     - Number of items compied.
     */

    /**
     * @return {CopyResult}
     */
    async execute(evt) {
        let { source, destination } = evt;
        let srcFilters = await messenger.MessageFilters.getForAccount(source);
        let destFilters = await messenger.MessageFilters.getForAccount(
            destination
        );
        let conflicts = this.getConflicts(srcFilters, destFilters);

        if (conflicts.length > 0) {
            let yes = await messenger.tabs.sendMessage(this.backend.tab.id, {
                type: events.EVENT_PROMPT_MSG_FILTER_CONFLICT,
                filters: srcFilters,
                conflicts
            });
            if (!yes)
                return {
                    type: "message-filters",
                    status: status.STATUS_ABORT
                };
        }

        let count = await messenger.MessageFilters.copy(
            evt.source,
            evt.destination
        );
        return {
            type: "message-filters",
            status: status.STATUS_COMPLETE,
            count
        };
    }
}

class TACBackend {
    /**
     * @type {tabs.Tab}
     */
    tab;

    /**
     * @type {Map<string, TACBCommand>}
     */
    commands = new Map([
        [events.EVENT_LIST_ACCOUNTS, new ListAccounts(this)],
        [events.EVENT_COPY_MSG_FILTERS, new CopyMsgFilters(this)]
    ]);

    /**
     * main function for the background script.
     *
     * Sets up our content tab and listeners so the the user can use the extension.
     */
    async main() {
        messenger.browserAction.onClicked.addListener(async () => {
            this.tab = await messenger.tabs.create({
                url: "/pages/index.html"
            });
        });

        messenger.runtime.onMessage.addListener(async (evt, sender) => {
            if (
                typeof evt !== "object" ||
                !this.tab ||
                !sender.tab ||
                sender.tab.id !== this.tab.id ||
                !this.commands.has(evt.type)
            ) {
                console.warn(`Ignoring message: `, evt);
                eturn;
            }

            return this.commands.get(evt.type).execute(evt);
        });
    }
}

new TACBackend().main();
