/**
 * Dialogs provides an API for showing prompts.
 */
export class Dialogs {
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

            let onClose = () => {
                this.el.removeEventListener("close", onClose);
                resolve();
            };

            this.el.addEventListener("close", onClose);
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
