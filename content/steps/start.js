import * as events from "/events.js";
import * as status from "/status.js";

/**
 * StartStep is the first stage in the process and allows the user to select
 * the source an destination accounts.
 */
export class StartStep {
    /**
     * @type {TACFrontend}
     */
    app;

    /**
     * @type {HTMLSelectElement}
     */
    srcSelect;

    /**
     * @type {HTMLSelectElement}
     */
    destSelect;

    /**
     * @type {HTMLButtonElement}
     */
    startButton;

    /**
     * @type {MailAccount[]}
     */
    accounts = [];

    /**
     * @param {TACFrontend} app
     */
    constructor(app) {
        this.app = app;
    }

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
     * getTemplate provides a copy of a template element's content given its id.
     *
     * @param {string{} id
     *
     * @return {DocumentFragment}
     */
    getTemplate(id) {
        return document.getElementById(id).content.cloneNode(true);
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

    /**
     * Dispatches the handle*() functions based on the details of the event
     * that occurred.
     * @param {Event} evt
     */
    async handleEvent(evt) {
        switch (evt.type) {
            case "change":
                this.handleSelectChange();
                break;

            case "click":
                this.handleStartClicked();
                break;

            default:
                break;
        }
    }

    /**
     * handleSelectChange enables the start button if both src and dest selects
     * are valid.
     */
    handleSelectChange() {
        if (this.srcSelect.value && this.destSelect.value)
            this.startButton.removeAttribute("disabled");
        else this.startButton.setAttribute("disabled", "");
    }

    /**
     * handleStartClicked kicks off the copy process.
     */
    async handleStartClicked() {
        this.startButton.setAttribute("disabled", "");

        let source = this.srcSelect.value;
        let destination = this.destSelect.value;
        let filterResult = await this.app.send({
            type: events.EVENT_COPY_MSG_FILTERS,
            source,
            destination
        });

        if (filterResult.status === status.STATUS_ABORT) return;

        await this.app.dialogs.tell(
            `Copied ${filterResult.count} filters successfully!`
        );

        let folderResult = await this.app.send({
            type: events.EVENT_COPY_MSG_FOLDERS,
            source,
            destination
        });

        if (folderResult.status === status.STATUS_ABORT) return;

        let { folderCount } = folderResult;

        await this.app.dialogs.tell(
            `Copied ${folderCount} folders successfully!`
        );
    }

    async execute() {
        let view = this.getTemplate("startStep");

        this.srcSelect = view.getElementById("source");
        this.destSelect = view.getElementById("destination");
        this.startButton = view.getElementById("start");
        this.accounts = await this.app.send({
            type: events.EVENT_LIST_ACCOUNTS
        });

        this.srcSelect.appendChild(this.getAccountOptions(this.accounts));
        this.destSelect.appendChild(this.getAccountOptions(this.accounts));

        this.srcSelect.addEventListener("change", this);
        this.destSelect.addEventListener("change", this);
        this.startButton.addEventListener("click", this);

        this.app.setContent(view);
    }
}
