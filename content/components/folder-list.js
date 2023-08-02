/**
 * FolderList displays a folder tree inclusive of any marked conflicts for
 * each node.
 */
export class FolderList extends HTMLElement {
    /**
     * folders to display in the list.
     *
     * Setting this value generates the DOM to be displayed.
     *
     * @type {MailFolderConflictInfo?}
     */
    set folders(value) {
        let root = document.createElement("ul");
        root.classList.add("folder-list-list");

        let stack = [[value, root]];
        while (stack.length > 0) {
            let [node, parent] = stack.pop();
            let li = document.createElement("li");
            let span = document.createElement("span");
            span.classList.add("folder-name");
            span.textContent = node.name;

            if (node.conflict && node.conflicts === 0) {
                span.classList.add("conflict");
            }

            li.appendChild(span);

            if (node.children.length > 0) {
                let ul = document.createElement("ul");
                if (node.conflicts > 0) span.classList.add("conflicts");
                for (let child of node.children) stack.push([child, ul]);
                li.appendChild(ul);
            }
            parent.appendChild(li);
        }

        if (value.conflicts > 0 && !value.isSpecial)
            root.classList.add("conflicts");
        this.replaceChildren(root);
    }
}
customElements.define("folder-list", FolderList);
