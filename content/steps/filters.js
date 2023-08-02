import * as events from "/events.js";
import * as status from "/status.js";

import { Step } from "/content/steps/index.js";

/**
 * FiltersStep handles the filter copying stage.
 */
export class FiltersStep extends Step {
    async onContinue() {
        this.app.setCanContinue(false);

        let { source, destination } = this.app;
        let filterResult = await this.app.send({
            type: events.MSG_COPY_MSG_FILTERS,
            source,
            destination
        });
        await this.app.dialogs.tell(
            `Copied ${filterResult.count} filters successfully!`
        );
        this.app.next();
    }

    /**
     * show displays a table with the found filters giving the user the option
     * to continue or abort.
     */
    async show() {
        let { source, destination } = this.app;
        let filters = await this.app.send({
            type: events.MSG_LIST_SOURCE_MSG_FILTERS,
            source,
            destination
        });

        let view = this.getTemplate("filtersStep");
        let tbody = view.querySelector("tbody");

        for (let filter of filters) {
            let tmpl = this.getTemplate("filtersStepRow");
            let cells = tmpl.querySelectorAll("td");
            cells[0].textContent = filter.name;
            cells[1].textContent = filter.description;
            cells[2].textContent = filter.conflict ? "Yes" : "No";

            if (filter.conflict) {
                tmpl.querySelector("tr").classList.add("conflict");
            }

            tbody.appendChild(tmpl);
        }

        this.app.setContent(view);
    }
}
