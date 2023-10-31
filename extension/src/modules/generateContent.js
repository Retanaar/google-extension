import {
    extractValues,
    getSelectedClient,
    getTopContainer,
    isValidURL,
    logger, markElementWithError, showError,
    toPlainExtractedObjectByIndex,
    URLJoin
} from "./utils.js";
import * as pageUidResolver from "./pageUidResolver.js";
import * as localDataStore from "./localDataStore.js";
import * as feeService from "./feeService.js";
import * as utmMarkerService from "./utmMarkersService.js";
import * as campaignService from "./campaignService.js";
import {UTM} from "./utmMarkersService.js";
import {MODULE} from "../config.js";

const log = logger('DataRefresh');

let _moduleConfig;
let _contentGenerator;
let _activeTab

export function init(activeTab, moduleConfig) {
    _moduleConfig = moduleConfig;
    _activeTab = activeTab;
    _contentGenerator = _getContentGeneratorForModule(moduleConfig.name);
}

export function reset() {
    _contentGenerator.reset();
}

export function refreshGeneratedContent() {
    return _contentGenerator.refreshGeneratedContent();
}

export function restoreState(state) {
    return _contentGenerator.restoreState(state);
}

export function checkControlsValid() {
    return _contentGenerator.checkControlsValid();
}

function _getContentGeneratorForModule(moduleName) {
    switch (moduleName) {
        case MODULE.Starboard.name:
            return new StarboardContentGenerator();
        case MODULE.Agency.name:
            return new AgencyContentGenerator();
    }
    throw `Unknown module [${moduleName}]`;
}

class CoreContentGenerator {

    constructor(pageIdResolver) {
        this._pageIdResolver = pageIdResolver;
    }
    reset() {
        this.refreshGeneratedContent();
    }

    restoreState(state) {
    }

    checkControlsValid() {
    }

    refreshGeneratedContent() {
        log('Refreshing generated content');
        const extractedValues = extractValues();
        const generatedContent = {
            ...toPlainExtractedObjectByIndex(extractedValues, 0),
            utmSource: utmMarkerService.getUtmValue(UTM.SOURCE),
            utmMedium: utmMarkerService.getUtmValue(UTM.MEDIUM),
            utmCampaign: utmMarkerService.getUtmValue(UTM.CAMPAIGN),
            utmContent: utmMarkerService.getUtmValue(UTM.CONTENT),
            pageRevvUID: this._pageIdResolver.pageId
        };
        this.appendContent(generatedContent, extractedValues);
        this.renderContent(generatedContent);
        feeService.setFeesToState(generatedContent);
        localDataStore.storeState(generatedContent);
        log('Generated content refreshed');
        campaignService.onStateUpdated();

        return generatedContent;
    }

    renderContent(generatedContent) {
    }

    appendContent(generatedContent, extractedValues) {}
}

class AgencyContentGenerator extends CoreContentGenerator {

    constructor() {
        super(new pageUidResolver.AgencyPageIdResolver(_activeTab));
        this._initUrlInputField();
        this.name = 'Agency'
    }

    checkControlsValid() {
        const sourceUrlLabel = getTopContainer().querySelector('#winred-page-setup-source-url-label');
        const sourceUrlValue = getTopContainer().querySelector('#winred-page-setup-source-url-input').value;
        const baseUrlLabel = getTopContainer().querySelector('#winred-page-setup-base-url-label');
        const baseUrlValue = getTopContainer().querySelector('#winred-page-setup-base-url').textContent;
        let isValid = true;
        if (!isValidURL(sourceUrlValue)) {
            markElementWithError(sourceUrlLabel, true);
            isValid = false;
        } else {
            markElementWithError(sourceUrlLabel, false);
            isValid = true;
        }

        if (baseUrlValue) {
            markElementWithError(baseUrlLabel, false);
            isValid &= true;
        } else {
            markElementWithError(baseUrlLabel, true);
            isValid &= false;
        }
        return isValid;
    }

    reset() {
        this._processUrl(_activeTab.url);
    }

    restoreState(state) {
        this._processUrl(state.sourceUrl);
    }

    appendContent(generatedContent, extractedValues) {
        const sourceUrl = getTopContainer().querySelector('#winred-page-setup-source-url-input').value;
        const baseUrl = getTopContainer().querySelector('#winred-page-setup-base-url').textContent;
        generatedContent.sourceUrl = sourceUrl;
        if (baseUrl) {
            generatedContent.slug = this._buildSlg(generatedContent, baseUrl);
            generatedContent.baseUrl = baseUrl;
        } else {
            generatedContent.slug = '';
            generatedContent.baseUrl = '';
        }
    }

    _buildSlg(genContent, baseUrl) {
        const url = new URL(baseUrl);
        const path = url.pathname;
        return [path.substring(path.lastIndexOf('/') + 1),
            genContent.utmSource,
            genContent.utmCampaign,
            genContent.utmMedium,
            genContent.utmContent].join('_');
    }

    renderContent(generatedContent) {
        super.renderContent(generatedContent);
        getTopContainer().querySelector('#winred-page-setup-page-revv-uid-input').textContent = generatedContent.pageRevvUID || '';
    }

    _initUrlInputField() {
        const inputField = getTopContainer().querySelector('#winred-page-setup-source-url-input');
        inputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                this._processUrl(inputField.value);
            }
        }.bind(this));
    }
    _processUrl(url) {
        log('Processing new URL');
        if (!isValidURL(url)) {
            log(`Invalid url, unable to parse [${url}]`);
            showError('Invalid URL');
            return;
        }
        const content = this._parseUrl(url);

        utmMarkerService.setUtmValue(UTM.CONTENT, content[UTM.CONTENT] || '');
        utmMarkerService.setUtmValue(UTM.CAMPAIGN, content[UTM.CAMPAIGN] || '');
        utmMarkerService.setUtmValue(UTM.MEDIUM, content[UTM.MEDIUM] || '');
        utmMarkerService.setUtmValue(UTM.SOURCE, content[UTM.SOURCE] || '');
        getTopContainer().querySelector('#winred-page-setup-source-url-input').value = url;
        getTopContainer().querySelector('#winred-page-setup-base-url').textContent = content.baseUrl;
        this._pageIdResolver.reset(() => this.refreshGeneratedContent());
        log('URL processed');
    }
    _parseUrl(url) {
        const searchParams = new URL(url).searchParams;
        const parsedUrl = new URL(url);
        parsedUrl.search = '';
        return {
            baseUrl: parsedUrl.toString(),
            [UTM.CONTENT]: searchParams.get('utm_content'),
            [UTM.CAMPAIGN]: searchParams.get('utm_campaign'),
            [UTM.MEDIUM]: searchParams.get('utm_medium'),
            [UTM.SOURCE]: searchParams.get('utm_source'),
        }
    }
}

class StarboardContentGenerator extends CoreContentGenerator {

    constructor() {
        super(new pageUidResolver.StarboardPageIdResolver(_activeTab));
        this._initSubdomainCheckBox();
        this._initPublicNameInput();
        this._pageIdResolver.reset();
        this.name = 'Starboard';
    }

    _initPublicNameInput() {
        getTopContainer().querySelector('#winred-page-setup-public-name-input')
            .addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    this.refreshGeneratedContent();
                }
            }.bind(this));
    }

    _initSubdomainCheckBox() {
        const subdomainCheckBox = getTopContainer().querySelector('#winred-page-setup-page-base-url-subdomain');
        subdomainCheckBox.addEventListener('change', this.refreshGeneratedContent);
        const state = localDataStore.getStoredState();
        if (state) {
            subdomainCheckBox.checked = state.subDomain;
        }
    }

    restoreState(state) {
        super.restoreState(state);
        getTopContainer().querySelector('#winred-page-setup-public-name-input').value = state.publicName;
    }

    reset() {
        getTopContainer().querySelector('#winred-page-setup-public-name-input').value = '';
        this._pageIdResolver.reset();
        super.reset();
    }

    refreshGeneratedContent() {
        this._updateSubdomainCheckBox();
        return super.refreshGeneratedContent();
    }

    checkControlsValid() {
        const publicName = getTopContainer().querySelector('#winred-page-setup-public-name-input').value || '';
        const publicNameLabel = getTopContainer().querySelector('#winred-page-setup-public-name-label');
        if (!publicName.trim()) {
            markElementWithError(publicNameLabel, true);
            return false;
        } else {
            markElementWithError(publicNameLabel, false);
            return true;
        }
    }

    appendContent(generatedContent, extractedValues) {
        generatedContent.slug = this._buildSlug(extractedValues);
        generatedContent.sourceCode = this._buildSourceCode(extractedValues);
        generatedContent.internalName = this._buildInternalName(extractedValues);
        generatedContent.publicName = getTopContainer().querySelector('#winred-page-setup-public-name-input').value;
        generatedContent.baseDomain = this._buildBaseDomain(extractedValues);
        generatedContent.subDomain = getTopContainer().querySelector('#winred-page-setup-page-base-url-subdomain').checked;
        generatedContent.pageRevvUID = this._pageIdResolver.pageId;
    }

    _updateSubdomainCheckBox() {
        const client = getSelectedClient();
        if (client) {
            const validUrl = isValidURL(client.subdomain);
            getTopContainer().querySelector('#winred-page-setup-page-base-url-subdomain').disabled = !validUrl;
            if (!validUrl) {
                getTopContainer().querySelector('#winred-page-setup-page-base-url-subdomain').checked = false;
            }
        }
    }

    renderContent(generatedContent) {
        super.renderContent(generatedContent);
        getTopContainer().querySelector('#winred-page-setup-internal-name-input').textContent = generatedContent.internalName || '';
        getTopContainer().querySelector('#winred-page-setup-slug-input').textContent = generatedContent.slug || '';
        getTopContainer().querySelector('#winred-page-setup-source-code-input').textContent = generatedContent.sourceCode || '';
        getTopContainer().querySelector('#winred-page-setup-page-revv-uid-input').textContent = generatedContent.pageRevvUID || '';
        getTopContainer().querySelector('#winred-page-setup-page-base-url').textContent = generatedContent.baseDomain || '';
    }

    _buildInternalName(extractedValues) {
        const po = toPlainExtractedObjectByIndex(extractedValues, 0);
        return `${po.client}_${po.pagetype}_${po.agency}_${po.source}_${po.campaign}-${po.topic}_${po.medium}_${po.date}`
    }

    _buildBaseDomain(extractedValues) {
        const client = getSelectedClient();
        const slug = this._buildSlug(extractedValues);
        if (client) {
            try {
                return URLJoin(this._getDomainForClient(client), slug);
            } catch (ex) {
                log(`Unable to build base domain for client: [${client.name}]`);
                return 'UNABLE TO BUILD';
            }
        }
        return slug;
    }
    _getDomainForClient(client) {
        const isSubDomain = getTopContainer().querySelector('#winred-page-setup-page-base-url-subdomain').checked;
        return isSubDomain ? client.subdomain : client.domain;
    }

    _buildSlug(extractedValues) {
        const po = toPlainExtractedObjectByIndex(extractedValues, 1);
        return `${po.client}_${po.pagetype}_${po.agency}_${po.source}_${po.campaign}-${po.topic}_${po.medium}_${po.date}`
    }

    _buildSourceCode(extractedValues) {
        const po = toPlainExtractedObjectByIndex(extractedValues, 0);
        return `${po.agency}_${po.source}_${po.campaign}_${po.issueOrTopic}_${po.date}`
    }
}


