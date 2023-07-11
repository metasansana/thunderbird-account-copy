{
    const { MailServices } = ChromeUtils.import(
        "resource:///modules/MailServices.jsm"
    );

    /**
     * MessageFilters provides an API into the nsIMsgFilter related internal
     * API.
     */
    const MessageFilters = {
        /**
         * copy message filters between two accounts.
         *
         * @param {string} src  - The key for the source account.
         * @param {string} dest - The key for the destination account.
         *
         * @return {number} - The number of filters actually copied.
         */
        async copy(src, dest) {
            let copied = 0;
            let srcAcc = MailServices.accounts.getAccount(src);
            let destAcc = MailServices.accounts.getAccount(dest);

            if (srcAcc && destAcc) {
                let srcSrv = srcAcc.incomingServer;
                let destSrv = destAcc.incomingServer;

                if (srcSrv && destSrv) {
                    let srcList = srcSrv.getFilterList(null);
                    let destList = destSrv.getFilterList(null);

                    if (srcList && destList) {
                        let offset = destList.filterCount;

                        for (copied; copied < srcList.filterCount; copied++) {
                            let filter = srcList.getFilterAt(copied);
                            destList.insertFilterAt(offset, filter);
                            offset++;
                        }
                    }
                }
            }

            return copied;
        }
    };

    this.MessageFilters = class extends ExtensionCommon.ExtensionAPI {
        getAPI() {
            return {
                MessageFilters
            };
        }
    };
}
