import * as events from "/events.js";
import * as status from "/status.js";

import { Step } from "/content/steps/index.js";

/**
 * StartStep is the first stage in the process and allows the user to select
 * the source an destination accounts.
 */
export class StartStep extends Step {
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
        return this.app.source && this.app.destination;
    }

    /**
     * onSelectChange enables the start button if both src and dest selects
     * are valid.
     *
     * @param {Event} evt
     */
    onSelectChange = evt => {
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
        let view = this.getTemplate("startStep");

        this.srcSelect = view.getElementById("source");
        this.destSelect = view.getElementById("destination");
        this.accounts = await this.app.send({
            type: events.MSG_LIST_ACCOUNTS
        });

        this.srcSelect.appendChild(this.getAccountOptions(this.accounts));
        this.srcSelect.onchange = this.onSelectChange;
        this.destSelect.onchange = this.onSelectChange;

        this.app.setContent(view);
    }
}
