{
    const { MailServices } = ChromeUtils.import(
        "resource:///modules/MailServices.jsm"
    );

    /**
     * @typedef {Object} FilterRef
     * @property {string}   - name
     * @property {string}   - description
     * @property {string[]} - searchTerms
     */

    /**
     * MessageFilters provides an API into the nsIMsgFilter related internal
     * API.
     */
    const MessageFilters = {
        /**
         * getForAccount produces the filter list for an account.
         * @param {string} key - The account key.
         *
         * @return {FilterRef[]}
         */
        async getForAccount(key) {
            let refs = [];

            let acct = MailServices.accounts.getAccount(key);

            if (acct) {
                let server = acct.incomingServer;

                if (server) {
                    let list = server.getFilterList(null);

                    if (list)
                        for (let i = 0; i < list.filterCount; i++) {
                            let filter = list.getFilterAt(i);
                            refs.push({
                                name: filter.filterName,
                                description: filter.filterDesc,
                                searchTerms: filter.searchTerms.map(
                                    term => term.termAsString
                                )
                            });
                        }
                }
            }

            return refs;
        },
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
