import * as events from "/events.js";
import * as status from "/status.js";

class Dialogs {
    /**
     * @type {HTMLDialogElement}
     */
    el;

    /**
     * @param {HTMLDialogElement} el
     */
    constructor(el) {
        this.el = el;
    }

    /**
     * @param {string} msg
     */
    async tell(msg) {
        return new Promise(resolve => {
            let container = document
                .getElementById("dialogContainer")
                .content.cloneNode(true);
            container.querySelector("#dialogBody").textContent = msg;
            container.querySelector("#dialogCancel").remove();

            this.el.replaceChildren(container);
            this.el.showModal();
        });
    }

    /**
     * @param {string} msg
     *
     * @return {boolean}
     */
    async prompt(msg) {
        return new Promise(resolve => {
            let container = document
                .getElementById("dialogContainer")
                .content.cloneNode(true);
            container.querySelector("#dialogBody").textContent = msg;

            container
                .querySelector("#dialogCancel")
                .addEventListener("click", () => {
                    resolve(false);
                });
            container
                .querySelector("#dialogOk")
                .addEventListener("click", () => {
                    resolve(true);
                });

            this.el.replaceChildren(container);

            this.el.showModal();
        });
    }
}

/**
 * TACFrontend is the main class for the content tab of this extension.
 */
class TACFrontend {
    /**
     * @type {Dialogs}
     */
    dialogs;

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
            return await this.dialogs.prompt(
                `We detected ${evt.conflicts.length} filters that already exist in
             the destination account. Continue copying?`
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
        let result = await send({
            type: events.EVENT_COPY_MSG_FILTERS,
            source: this.srcSelect.value,
            destination: this.destSelect.value
        });

        if (result.status === status.STATUS_ABORT) return;

        await this.dialogs.tell(`Copied ${result.count} filters successfully!`);
    }

    async run() {
        this.dialogs = new Dialogs(document.getElementById("dialogs"));
        this.srcSelect = document.getElementById("source");
        this.destSelect = document.getElementById("destination");
        this.startButton = document.getElementById("start");
        this.accounts = await send({ type: events.EVENT_LIST_ACCOUNTS });

        this.srcSelect.appendChild(this.getAccountOptions(this.accounts));
        this.destSelect.appendChild(this.getAccountOptions(this.accounts));

        this.srcSelect.addEventListener("change", this);
        this.destSelect.addEventListener("change", this);
        this.startButton.addEventListener("click", this);
    }

    static main() {
        let app = new TACFrontend();
        browser.runtime.onMessage.addListener(evt => app.onMessage(evt));
        window.addEventListener("load", () => app.run());
    }
}

const send = evt => browser.runtime.sendMessage(evt);

TACFrontend.main();
