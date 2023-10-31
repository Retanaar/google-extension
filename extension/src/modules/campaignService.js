import * as contentService  from "./generateContent.js";
import * as dataLoader from "./dataLoader.js";
import {
    constants,
    getTopContainer,
    logger,
    setControlsDisabled, setKeepDisabledById,
    setStatus, showError,
} from "./utils.js";
import * as feeService from "./feeService.js";
import {MODULE} from "../config.js";

const log = logger('CampaignStore');

let _moduleConfig
let _moduleSpecificService
export function init(moduleConfig) {
    _moduleConfig = moduleConfig;
    _moduleSpecificService = _getCampaignService(moduleConfig);
}

function _getCampaignService(moduleConfig) {
    _moduleConfig = moduleConfig;
    return new CoreCampaignService();
}

export function onStateUpdated() {
    log('onFormDataUpdated');
    _moduleSpecificService.checkNewCampaignButtonEnabled();
}

export function onCampaignInserted(newCampaign, status) {
    log(`New campaign inserted [${newCampaign.slug}]`);
    dataLoader.resetState(newCampaign);
    setStatus(status);
    setControlsDisabled(false);
}

export function processCampaignStoreResponse(fetchedCampaign) {
    _moduleSpecificService.processCampaignStoreResponse(fetchedCampaign);
}

class CoreCampaignService {

    constructor() {
        this._initNewCampaignButton();
    }

    processCampaignStoreResponse(fetchedCampaign) {
        const newCampaign = contentService.refreshGeneratedContent();
        log('Get campaign by ID ready');
        if (!fetchedCampaign) {
            log(`Campaign [${newCampaign.slug}] not found, creating a new one`);
            this._sendUpsertCampaignRequest(newCampaign);
        } else {
            window.alert('Campaign already exists, skipping\n\n\n');
            onCampaignInserted(fetchedCampaign, 'Ready');
        }
    }

    _sendUpsertCampaignRequest(newCampaign) {
        log(`Adding new campaign [${JSON.stringify(newCampaign)}]`);
        chrome.runtime.sendMessage({action: constants.WINRED_SETUP.ACTION_POST_UPSERT_CAMPAIGN,
            campaignType: _moduleConfig.name,
            campaign: newCampaign}, (response) => {});
    }


    _initNewCampaignButton() {
        getTopContainer().querySelector('#winred-page-setup-new-campaign').addEventListener('click', () => {
            log(`Creating new campaign`);
            if (!this.checkNewCampaignButtonEnabled()) {
                showError('Fix validation errors');
                return;
            }
            setControlsDisabled(true);
            setStatus('Checking for campaign ...');
            const generatedContent = contentService.refreshGeneratedContent();
            const slug = generatedContent.slug;
            const campaignType = _moduleConfig.name;
            chrome.runtime.sendMessage({action: constants.WINRED_SETUP.ACTION_GET_CAMPAIGN_BY_SLUG, campaignType, slug}, (response) => {});
        });
        log('Push button initialized');
    }

    checkNewCampaignButtonEnabled() {
        let newCampaignEnabled = dataLoader.checkSelectsValid(_moduleConfig.campaignBlockers);
        newCampaignEnabled &= feeService.checkFeesCorrect();
        newCampaignEnabled &= contentService.checkControlsValid();
        log(`New campaign button`);
        setKeepDisabledById('winred-page-setup-new-campaign', !newCampaignEnabled);
        return newCampaignEnabled;
    }
}
