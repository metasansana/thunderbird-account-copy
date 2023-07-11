import * as events from "/events.js";

/**
 * main function for the background script.
 *
 * Sets up our content tab and listeners so the the user can use the extension.
 */
const main = async () => {
    let tab;
    messenger.browserAction.onClicked.addListener(async () => {
        tab = await messenger.tabs.create({ url: "/pages/index.html" });
    });

    messenger.runtime.onMessage.addListener(async (evt, sender) => {
        if (
            typeof evt !== "object" ||
            !tab ||
            !sender.tab ||
            sender.tab.id !== tab.id
        )
            return;

        switch (evt.type) {
            case events.EVENT_LIST_ACCOUNTS:
                return messenger.accounts.list(false);

            case events.EVENT_COPY_MSG_FILTERS:
                return messenger.MessageFilters.copy(
                    evt.source,
                    evt.destination
                );
        }
    });
};

main();
