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
     * @param {object}
     */
    async send(evt) {
        return await messenger.tabs.sendMessage(this.backend.tab.id, evt);
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
 * CompareMsgFilters provides a list of message filters from the source
 * account indicating which ones may be in conflict with the destination.
 */
class CompareMsgFilters extends TACBCommand {
    /**
     * isSame tests whether two filters are the same or not.
     *
     * Filters do not have unique identifiers so we make an assumption based on
     * the name, description and search terms of a filter.
     *
     * @param {FilterRef} filterA
     * @param {FilterRef} filterB
     *
     * @return {boolean}
     */
    isSame(filterA, filterB) {
        return (
            filterA.name === filterB.name &&
            filterA.description === filterB.description &&
            filterA.searchTerms.join() === filterB.searchTerms.join()
        );
    }

    /**
     * Provides a modified list of filter refs that will each have a boolean
     * valued "conflict" key.
     *
     * @return {FilterRef[]}
     */
    async execute(evt) {
        let { source, destination } = evt;
        let srcFilters = await messenger.MessageFilters.getForAccount(source);
        let destFilters = await messenger.MessageFilters.getForAccount(
            destination
        );
        return srcFilters.map(filter => {
            let match = destFilters.find(f => this.isSame(filter, f));
            return Object.assign({}, filter, { conflict: !!match });
        });
    }
}

/**
 * CopyMsgFilters copies message filters from one account to another.
 */
class CopyMsgFilters extends TACBCommand {
    /**
     * @typedef {Object} CopyResult
     *
     * @property {string} type      - "message-filters"
     * @property {number} status    - 0=aborted, 1=complete -1=error
     * @property {number} count     - Number of items copied.
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

/**
 * CompareMsgFolders provides a list of message folders from the source
 * account indicating which ones may be in conflict with the destination.
 */
class CompareMsgFolders extends TACBCommand {
    /**
     * @return {MailFolder[]}
     */
    async execute(evt) {
        let { source, destination } = evt;
        let srcAcct = await messenger.accounts.get(source, true);
        let destAcct = await messenger.accounts.get(destination, true);
        let srcFolders = MailFolderNode.fromAccount(srcAcct);
        let destFolders = MailFolderNode.fromAccount(destAcct);
        return srcFolders.compare(destFolders);
    }
}

/**
 * CopyMsgFolders copies message folders from one account to another.
 *
 * This command will also take care of copying the messages included in the
 * folders.
 */
class CopyMsgFolders extends TACBCommand {
    /**
     * @return {CopyResult}
     */
    async execute(evt) {
        let { source, destination } = evt;
        let srcAcct = await messenger.accounts.get(source, true);
        let destAcct = await messenger.accounts.get(destination, true);
        let srcFolders = MailFolderNode.fromAccount(srcAcct);
        let destFolders = MailFolderNode.fromAccount(destAcct);
        return Object.assign(
            {
                type: "message-folders",
                status: status.STATUS_COMPLETE
            },
            await srcFolders.transfer(destFolders)
        );
    }
}

const folderTypes = [
    "inbox",
    "drafts",
    "sent",
    "trash",
    "templates",
    "archives",
    "junk",
    "outbox"
];

const ignoredFolderTypes = ["trash", "junk"];

/**
 * MailFolderConflictInfo stores information about conflicts between two folder
 * trees.
 */
class MailFolderConflictInfo {
    /**
     * conflict indicates the folder for this node conflicts with a node at the
     * same location in the compared tree.
     *
     * @type {boolean}
     */
    conflict = false;

    /**
     * conflicts is a count of all conflicts encountered in this folders children.
     *
     * @type {number}
     */
    conflicts = 0;

    /**
     * children MailFolderConflictInfo of this one.
     *
     * @type {MailFolderConflictInfo[]}
     */
    children = [];

    /**
     * name of the folder.
     *
     * @type {string}
     */
    name = "";

    /**
     * type of the folder retrieved from the underlying folder or "user" if
     * none specified.
     *
     * @type {string}
     */
    type = "";

    /**
     * isSpecial indicates whether the folder is considered a special folder.
     *
     * @type {boolean}
     */
    isSpecial = false;

    /**
     * @param {string} name
     * @param {string} type
     * @param {boolean} isSpecial
     */
    constructor(name, type, isSpecial) {
        this.name = name;
        this.type = type;
        this.isSpecial = isSpecial;
    }

    /**
     * fromMailFolderNode creates a new instance from a MailFolderNode.
     *
     * Note that this only sets the name, type and isSpecial properties.
     */
    static fromMailFolderNode({ name, type, isSpecial }) {
        return new MailFolderConflictInfo(name, type, isSpecial);
    }
}

/**
 * MailFolderNode is a wrapper around messenger.folders'  MailFolder type.
 *
 * This wrapper helps us preserve the structure of the folder tree while
 * computing potential conflicts and create new nodes.
 */
class MailFolderNode {
    /**
     * folder is the underlying messenger.folders.MailFolder type.
     *
     * @type {MailFolder} folder
     */
    folder;

    /**
     * account the folder belongs to.
     *
     * @type {MailAccount}
     */
    account;

    /**
     * isRoot indicates whether the MailFolderNode represents the root of the
     * tree.
     *
     * @type {boolean} isRoot
     */
    isRoot;

    /**
     * children stores the child nodes of the folder wrapped in MailFolderNodes.
     *
     * @type {MailFolderNode[]}
     */
    children = [];

    /**
     * @param {FolderInfo} folder
     * @param {MailAccount} account;
     * @param {boolean} isRoot
     */
    constructor(folder, account, isRoot = false) {
        this.folder = folder;
        this.account = account;
        this.isRoot = isRoot;
    }

    /**
     * name of the folder.
     *
     * @type {string}
     */
    get name() {
        return this.folder.name || "<root>";
    }

    /**
     * type of the folder retrieved from the underlying folder or "user" if
     * none specified.
     *
     * @type {string}
     */
    get type() {
        return this.folder.type || "user";
    }

    /**
     * isSpecial indicates whether the folder is considered a special folder.
     *
     * @type {boolean}
     */
    get isSpecial() {
        return folderTypes.includes(this.type);
    }

    /**
     * shouldIgnore if true, indicates the folder should not be copied.
     *
     * @type {boolean}
     */
    get shouldIgnore() {
        return ignoredFolderTypes.includes(this.type);
    }

    /**
     * fromAccount creates a root MailFolderNode from a MailAccount.
     *
     * @param  {MailAccount} account
     */
    static fromAccount(account) {
        let root = new MailFolderNode(
            { subFolders: account.folders },
            account,
            true
        );
        let stack = [root];
        while (stack.length !== 0) {
            let parent = stack.pop();
            for (let folder of parent.folder.subFolders) {
                let child = new MailFolderNode(folder, account);
                parent.append(child);
                stack.push(child);
            }
        }
        return root;
    }

    /**
     * append a child node into the list of children for this MailFoderNode.
     *
     * @param {MailFolderNode} child
     */
    append(child) {
        this.children.push(child);
    }

    /**
     * isSame tests whether a folder has the same name as this folder.
     */
    isSame(target) {
        return this.folder.name === target.folder.name;
    }

    /**
     * toArray converts the tree into a flat array where the order of the
     * nodes are preserved.
     *
     * @return {MailFolderNode[]}
     */
    toArray() {
        let stack = this.folder.subFolders.slice();
        let list = [];
        while (stack.length > 0) {
            let fldr = stack.pop();
            list.push(fldr);
            if (fldr.subFolders.length !== 0) {
                stack = stack.concat(fldr.subFolders);
            }
        }
        return list;
    }

    /**
     * count the number of messages in the folder.
     */
    async count() {
        let { totalMessageCount } = await messenger.folders.getFolderInfo(
            this.folder
        );
        return totalMessageCount;
    }

    /**
     * compare this MailFolderNode tree to another to determine which of this
     * tree's nodes will conflict with it.
     *
     * This method returns a tree that stores conflict information for each
     * node.
     *
     * @param {MailFolderNode} target
     *
     * @return {MailFolderConflictInfo}
     */
    compare(target) {
        let root = new MailFolderConflictInfo(
            this.name,
            this.type,
            this.isSpecial
        );
        let stack = [[this, target, root]];
        while (stack.length > 0) {
            let [src, dest, parent] = stack.pop();

            if (src.shouldIgnore) continue;

            let clone = src.isRoot
                ? parent
                : MailFolderConflictInfo.fromMailFolderNode(src);

            if (!src.isRoot) {
                if (dest) {
                    clone.conflict = true;
                    parent.conflicts++;
                }
                parent.children.push(clone);
            }

            for (let child of src.children) {
                let destNode =
                    dest && dest.children.find(dc => dc.isSame(child));
                stack.push([child, destNode, clone]);
            }
        }
        return root;
    }

    /**
     * transfer takes care of the copying and merging of folders from this tree
     * to another tree.
     *
     * @param {MailFolderNode} target - Should be a root node.
     */
    async transfer(target) {
        let folderCount = 0;
        let messageCount = 0;
        let stack = [[this, target, target]];
        let merged = false;
        while (stack.length > 0) {
            let [src, dest, parent] = stack.pop();
            if (src.shouldIgnore) continue;
            if (!src.isRoot) {
                folderCount++;
                if (!dest) {
                    dest = await src.copy(parent);
                    messageCount += await dest.count();
                    continue; // Children are copied automatically.
                }
                messageCount += await src.merge(dest);
            }
            for (let child of src.children) {
                let childDest = dest.children.find(dc => dc.isSame(child));
                stack.push([child, childDest, dest]);
            }
        }
        return { folderCount, messageCount };
    }

    /**
     * copy this MailFolderNode to the target parent folder.
     *
     * This is used when a folder does not exist at the same location in the
     * root target tree.
     *
     * @param {MailFolderNode} target - Serves as the parent.
     *
     * @return {MailFolderNode}
     */
    async copy(target) {
        //TODO: Remove debug code.
        console.error("Copying ", this.folder, " to ", target.folder);
        return new MailFolderNode(
            await messenger.folders.copy(
                this.folder,
                target.isRoot ? target.account : target.folder
            ),
            target.account
        );
    }

    /**
     * merge copies the messages from this MailFolderNode to the merge target.
     *
     * This is used when a folder exists at the same location in the root
     * target tree.
     *
     * @return {number} - The number of messages copied.
     */
    async merge(target) {
        //TODO: Remove debug code.
        console.error("Merging ", this.folder, " into ", target.folder);
        let { folder } = this;
        let dest = target.folder;
        let info = await messenger.folders.getFolderInfo(folder);
        let chunk = await messenger.messages.list(folder);
        let count = chunk.messages.length;
        await messenger.messages.copy(
            chunk.messages.map(m => m.id),
            dest
        );

        while (chunk.id) {
            chunk = await messenger.messages.continueList(chunk.id);
            await messenger.messages.copy(
                chunk.messages.map(m => m.id),
                dest
            );
            count = count + chunk.messages.length;
        }

        return count;
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
        [events.MSG_LIST_ACCOUNTS, new ListAccounts(this)],
        [events.MSG_COMPARE_MSG_FILTERS, new CompareMsgFilters(this)],
        [events.MSG_COPY_MSG_FILTERS, new CopyMsgFilters(this)],
        [events.MSG_COMPARE_MSG_FOLDERS, new CompareMsgFolders(this)],
        [events.MSG_COPY_MSG_FOLDERS, new CopyMsgFolders(this)]
    ]);

    /**
     * main function for the background script.
     *
     * Sets up our content tab and listeners so the the user can use the extension.
     */
    async main() {
        messenger.browserAction.onClicked.addListener(async () => {
            if (this.tab) {
                await messenger.tabs.update(this.tab.id, { active: true });
            } else {
                this.tab = await messenger.tabs.create({
                    url: "/content/index.html"
                });
            }
        });

        messenger.tabs.onRemoved.addListener(id => {
            if (this.tab && this.tab.id === id) this.tab = null;
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
                return;
            }

            return this.commands.get(evt.type).execute(evt);
        });
    }
}

new TACBackend().main();
