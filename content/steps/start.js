import * as events from "/events.js";
import * as status from "/status.js";

import { Step } from "/content/steps/index.js";

/**
 * StartStep is the first stage in the process and allows the user to select
 * the source an destination accounts.
 */
export class StartStep extends Step {
    /**
     * @type {HTMLInputElement}
     */
    includeFilters;

    /**
     * @type {HTMLInputElement}
     */
    includeFolders;

    /**
     * @type {HTMLSelectElement}
     */
    srcSelect;

    /**
     * @type {HTMLSelectElement}
     */
    destSelect;

    /**
     * @type {MailAccount[]}
     */
    accounts = [];

    get canContinue() {
        return (
            this.app.source &&
            this.app.destination &&
            (this.includeFilters.checked || this.includeFolders.checked)
        );
    }

    /**
     * onIncludeChanged handles the user toggling the data copy targets.
     */
    onIncludeChanged = () => {
        let skip = [];

        if (!this.includeFilters.checked) skip.push(this.includeFilters.name);

        if (!this.includeFolders.checked) skip.push(this.includeFolders.name);

        this.app.skip = skip;

        this.app.setCanContinue(this.canContinue);
    };

    /**
     * onAccountChanged enables the start button if both src and dest selects
     * are valid.
     *
     * @param {Event} evt
     */
    onAccountChanged = evt => {
        if (evt.target.id === "source") {
            let { value } = evt.target;
            this.app.source = value;

            let destAccounts = this.accounts.filter(acc => acc.id !== value);
            for (let opt of [...this.destSelect.querySelectorAll("option")])
                if (opt.value) opt.remove();

            this.destSelect.appendChild(this.getAccountOptions(destAccounts));
        } else if (evt.target.id === "destination") {
            this.app.destination = evt.target.value;
        }
        this.app.setCanContinue(this.app.source && this.app.destination);
    };

    /**
     * @param {MailAccount[]}
     *
     * @return {DocumentFragment}
     */
    getAccountOptions(accounts) {
        let options = document.createDocumentFragment();
        for (let act of accounts) {
            let option = document.createElement("option");
            option.value = act.id;
            option.textContent = act.name;
            options.appendChild(option);
        }
        return options;
    }

    /**
     * onMessage handles events from the background script.
     */
    async onMessage(evt) {
        if (evt.type === events.EVENT_PROMPT_MSG_FILTER_CONFLICT) {
            return this.app.dialogs.prompt(
                `We detected ${evt.conflicts.length} filters that already exist in
             the destination account. Continue copying?`
            );
        } else if (evt.type === events.EVENT_PROMPT_MSG_FOLDER_CONFLICT) {
            return this.app.dialogs.prompt(
                `We detected ${evt.conflicts.length} folders that already exist
            in the destination account. If you continue, they will be merged.
            Continue?`
            );
        }
    }

    async show() {
        this.accounts = await this.app.send({
            type: events.MSG_LIST_ACCOUNTS
        });

        let view = this.getTemplate("startStep");

        this.includeFilters = view.getElementById("includeFilters");
        this.includeFolders = view.getElementById("includeFolders");
        this.includeFilters.onchange = this.onIncludeChanged;
        this.includeFolders.onchange = this.onIncludeChanged;
        this.includeFilters.checked = !this.app.skip.includes(
            this.includeFilters.name
        );
        this.includeFolders.checked = !this.app.skip.includes(
            this.includeFolders.name
        );

        this.srcSelect = view.getElementById("source");
        this.destSelect = view.getElementById("destination");
        this.srcSelect.appendChild(this.getAccountOptions(this.accounts));
        this.srcSelect.onchange = this.onAccountChanged;
        this.destSelect.onchange = this.onAccountChanged;

        this.app.setContent(view);
    }
}
