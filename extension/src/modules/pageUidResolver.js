
import {constants, isEditPage, logger, showError} from "./utils.js";

const log = logger('PageIdResolver');

class CorePadeIdResolver {

    constructor(activeTab) {
        this._activeTab = activeTab;
        this._pageId = '';
    }

    get activeTab() {
        return this._activeTab;
    }
    get pageId() {
        return this._pageId;
    }

    set pageId(pageId) {
        this._pageId = pageId;
    }
    static _getMetaContent(rootElement, name) {
        const metaTag = rootElement.querySelector(`meta[name=${name}]`);
        return metaTag.getAttribute('content');
    }
}

export class StarboardPageIdResolver extends CorePadeIdResolver {

    constructor(activeTab) {
        super(activeTab);
    }
    reset() {
        const url = this._activeTab.url;
        if (isEditPage(url)) {
            const parts = url.split('/');
            this.pageId = parts[parts.length - 1];
        }
    }
}

export class AgencyPageIdResolver extends CorePadeIdResolver {
    constructor(activeTab) {
        super(activeTab);
    }

    reset(callback) {
        chrome.tabs.sendMessage(this.activeTab.id, {action: constants.WINRED_SETUP.ACTION_GET_IDs_FROM_PAGE}, (response) => {
            log(`Processing Get ID response: [${JSON.stringify(response)}]`);
            this.pageId = 'Unknown';
            if (response) {
                if (response.error) {
                    showError(response.error);
                } else {
                    this.pageId = response.data.pageId;

                }
            }
            callback();
        });

    }
    static extractIdsFromPage() {
        return {
            orgId: super._getMetaContent(document,'organization_revv_uid'),
            pageId: super._getMetaContent(document,'page-uid'),
        };
    }

}

