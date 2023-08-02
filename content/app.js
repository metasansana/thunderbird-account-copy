import { Dialogs } from "/content/dialogs.js";
import { StartStep } from "/content/steps/start.js";
import { FiltersStep } from "/content/steps/filters.js";

/**
 * TACFrontend is the main class for the content tab of this extension.
 */
class TACFrontend {
    /**
     * @type {Dialogs}
     */
    dialogs = new Dialogs(document.getElementById("dialogs"));

    /**
     * steps contain an object for each of the main stages involved in the copy
     * process.
     *
     * @type {Step[]}
     */
    steps = [];

    /**
     * index points to the current step in the step list.
     *
     * @type {number}
     */
    index = 0;

    /**
     * cancelButton
     *
     * @type {HTMLButtonElement}
     */
    cancelButton = document.getElementById("cancelButton");

    /**
     * continueButton
     *
     * @type {HTMLButtonElement}
     */
    continueButton = document.getElementById("continueButton");

    /**
     * source is the account id/key for the source account.
     *
     * @type {string}
     */
    source;

    /**
     * destination is the account id/key for the destination account.
     */
    destination;

    /**
     * current provides the current Step instance based on the index pointer.
     *
     * @type {Step}
     */
    get current() {
        return this.steps[this.index];
    }

    /**
     * onMessage handler bridges the backend to the current step class.
     *
     * @param {any} msg
     */
    onMessage = msg => {
        return this.current.onMessage(msg);
    };

    /**
     * setContent changes the content displayed by the extension.
     *
     * @param {HTMLElement} content;
     */
    setContent(content) {
        let { cancelButton } = this;
        if (this.index === 0) cancelButton.setAttribute("hidden", "");
        else cancelButton.removeAttribute("hidden");

        this.setCanContinue(this.current.canContinue);

        this.continueButton.textContent =
            this.index === 0 ? "Start" : "Continue";

        let container = document.getElementById("content");
        container.replaceChildren(content);
    }

    /**
     * setCanContinue enables/disables the continue button.
     *
     * @param {boolean} state - true=enabled, false=disabled
     */
    setCanContinue(state) {
        if (state) {
            this.continueButton.removeAttribute("disabled");
        } else {
            this.continueButton.setAttribute("disabled", "");
        }
    }

    /**
     * next advances the pointer to the next step triggering its show()
     * method.
     */
    next() {
        this.index++;
        this.current.show();
    }

    /**
     * send a message to the background script.
     *
     * @param {any} msg
     *
     * @return {any?}
     */
    async send(msg) {
        return browser.runtime.sendMessage(msg);
    }

    /**
     * start the app.
     *
     * Makes the app steps available and brings up the UI.
     */
    start() {
        this.index = 0;
        this.steps = [new StartStep(this), new FiltersStep(this)];
        this.cancelButton.onclick = () => {
            this.start(); // resets the app.
        };
        this.continueButton.onclick = () => {
            this.current.onContinue();
        };
        this.current.show();
    }

    /**
     * main method for the app.
     *
     * Creates a new app instance and sets up the back-end and "load" event
     * listeners.
     */
    static main() {
        let app = new TACFrontend();
        browser.runtime.onMessage.addListener(app.onMessage);
        window.addEventListener("load", () => app.start());
    }
}

TACFrontend.main();
