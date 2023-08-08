import * as events from "/events.js";
import * as status from "/status.js";

import { Step } from "/content/steps/index.js";
import { FolderList } from "/content/components/folder-list.js";

/**
 * FoldersStep handles the folder copying stage.
 */
export class FoldersStep extends Step {
    name = "folders";

    async onContinue() {
        this.app.busy();

        let { source, destination } = this.app;
        let result = await this.app.send({
            type: events.MSG_COPY_MSG_FOLDERS,
            source,
            destination
        });

        let { folderCount } = result;

        await this.app.dialogs.tell(
            `Copied ${folderCount} folders successfully!`
        );

        this.app.next();
    }

    /**
     * show displays a table with the found filters giving the user the option
     * to continue or abort.
     */
    async show() {
        let { source, destination } = this.app;
        let folders = await this.app.send({
            type: events.MSG_COMPARE_MSG_FOLDERS,
            source,
            destination
        });

        let list = document.createElement("folder-list");
        list.folders = folders;

        let view = this.getTemplate("foldersStep");
        let win = view.querySelector(".table-window");
        win.appendChild(list);

        this.app.setContent(view);
    }
}
