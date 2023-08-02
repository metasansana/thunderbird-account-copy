import * as events from "/events.js";
import * as status from "/status.js";

/**
 * Step is one of the main stages of the copy process.
 *
 * Each stage or step is encapsulated into a single class that takes care of
 * setting up the needed UI and performing the necessary logic to copy data
 * successfully.
 *
 * @abstract
 */
export class Step {
    /**
     * An instance of the main app.
     *
     * @type {TACFrontend}
     */
    app;

    /**
     * @param {TACFrontend} app
     */
    constructor(app) {
        this.app = app;
    }

    /**
     * canContinue lets the app know if the continue button should be displayed
     * or not.
     */
    get canContinue() {
        return true;
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
    onMessage(evt) {}

    /**
     * onContinue is called when the "continue" button is clicked.
     *
     * By default this advances to the next step.
     */
    onContinue() {
        this.app.next();
    }

    /**
     * show the view for this step.
     */
    show() {}
}
