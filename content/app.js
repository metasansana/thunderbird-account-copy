import { Dialogs } from "/content/dialogs.js";
import { StartStep } from "/content/steps/start.js";

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
    steps = [new StartStep(this)];

    /**
     * index points to the current step in the step list.
     *
     * @type {number}
     */
    index = 0;

    /**
     * current provides the current Step instance based on the index pointer.
     *
     * @type {Step}
     */
    get current() {
        return this.steps[this.index];
    }

    /**
     * setContent changes the content displayed by the extension.
     *
     * @param {HTMLElement} content;
     */
    setContent(content) {
        let container = document.getElementById("content");
        container.replaceChildren(content);
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

    static main() {
        let app = new TACFrontend();
        browser.runtime.onMessage.addListener(evt =>
            app.current.onMessage(evt)
        );
        window.addEventListener("load", () => app.current.execute());
    }
}

TACFrontend.main();
