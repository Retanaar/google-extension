
let log;
let constants;
let pageUidResolver;
let editPageUpdater;

(async () => {
    const src = chrome.runtime.getURL("./modules/utils.js");
    const common = await import(src);
    log = common.logger('Content');
    constants = common.constants;
})();

(async () => {
    const src = chrome.runtime.getURL("./modules/pageUidResolver.js");
    pageUidResolver = await import(src);
})();

(async () => {
    const src = chrome.runtime.getURL("./modules/editPageUpdater.js");
    editPageUpdater = await import(src);
})();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log(`onMessage: [${message.action}]`)
    const response = { action: message.action };
    try {
        switch (message.action) {
            case constants.WINRED_SETUP.ACTION_GET_IDs_FROM_PAGE:
                response.data = pageUidResolver.AgencyPageIdResolver.extractIdsFromPage();
                break;
            case constants.WINRED_SETUP.ACTION_SET_PAGE_DETAILS:
                const data = message.data;
                response.data = editPageUpdater.setEditPageDetails(
                    data.internalName, data.slug, data.publicName, data.sourceCode);
                log('Page details updated');
                break;
        }
    } catch (exception) {
        log(`Exception: [${JSON.stringify(exception)}]`)
        response.error = exception;
    }
    log(`Message processed [${message.action}]`)
    sendResponse(response);
})
