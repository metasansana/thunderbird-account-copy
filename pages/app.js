import * as events from "/events.js";

/**
 * AppController is the main class for the content tab of this extension.
 */
class AppController {
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
     * @type {HTMLDialogElement}
     */
    prompt;

    /**
     * @type {MailAccount[]}
     */
    accounts = [];

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
        let result = await send({
            type: events.EVENT_COPY_MSG_FILTERS,
            source: this.srcSelect.value,
            destination: this.destSelect.value
        });

        this.prompt.querySelector(
            "#promptContent"
        ).textContent = `Copied ${result} filters!`;

        this.prompt.showModal();
    }

    async run() {
        this.srcSelect = document.getElementById("source");
        this.destSelect = document.getElementById("destination");
        this.startButton = document.getElementById("start");
        this.prompt = document.getElementById("prompt");
        this.accounts = await send({ type: events.EVENT_LIST_ACCOUNTS });

        this.srcSelect.appendChild(this.getAccountOptions(this.accounts));
        this.destSelect.appendChild(this.getAccountOptions(this.accounts));

        this.srcSelect.addEventListener("change", this);
        this.destSelect.addEventListener("change", this);
        this.startButton.addEventListener("click", this);
    }

    static main() {
        let ctl = new AppController();
        window.addEventListener("load", () => ctl.run());
    }
}

const send = evt => browser.runtime.sendMessage(evt);

AppController.main();
