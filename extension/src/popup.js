console.log('adfasdf');

import {
    constants,
    logger,
    setControlsDisabled,
    setKeepDisabled,
    setStatus,
    setTemplate,
    showError
} from "./modules/utils.js";
import * as config from "./config.js";
import * as dataLoader from "./modules/dataLoader.js";
import * as generatedContent from "./modules/generateContent.js";
import * as campaignService from "./modules/campaignService.js";
import * as editPageUpdater from "./modules/editPageUpdater.js";
import * as feeService from "./modules/feeService.js";
import * as copyToClipboard from "./modules/copyToClipboard.js";
import * as dataAddService from "./modules/dataAddService.js";
import * as dataStore from "./modules/localDataStore.js";
import * as settings from "./modules/settings.js";

const log = logger('Popup');

let _activeTab;

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    log('`chrome.tabs.query` invoked');
    if (tabs && tabs.length > 0) {
        settings.addEnvironmentToTemplate();
        chrome.runtime.sendMessage({
            action: constants.WINRED_SETUP.INIT_URL_BY_ENVIRONMENT,
            data: { env: settings.currentEnvironment() }
        });
        _initSwitchControls();
        _activeTab = tabs[0];
        const activeModuleConfig = config.MODULE[dataStore.getActiveModule()] || config.MODULE.Starboard;
        log(`Using module config [${JSON.stringify(activeModuleConfig)}]`);
        _setModule(_activeTab, activeModuleConfig);
    }
});

function _setModule(activeTab, moduleConfig) {
    log(`Switching module to [${moduleConfig.name}]`);
    setTemplate(moduleConfig.prefix);
    setControlsDisabled(true);
    dataStore.init(moduleConfig);
    switch (moduleConfig.name) {
        case config.MODULE.Starboard.name:
            _initStarboard(activeTab, moduleConfig);
            break;
        case config.MODULE.Agency.name:
            _initAgency(activeTab, moduleConfig);
            break;
        case config.MODULE.Settings.name:
            settings.init();
            break;
    }
    setControlsDisabled(false);
    setStatus('Ready');
    log(`Module switched to [${moduleConfig.name}]`);
}

function _initStarboard(activeTab, activeModuleConfig) {
    dataLoader.init(activeModuleConfig);
    generatedContent.init(activeTab, activeModuleConfig);
    campaignService.init(activeModuleConfig);
    editPageUpdater.init(activeTab);
    feeService.init();
    copyToClipboard.init();
    dataAddService.init();
    dataLoader.afterInit();
}

function _initAgency(activeTab, activeModuleConfig) {
    dataLoader.init(activeModuleConfig);
    generatedContent.init(activeTab, activeModuleConfig);
    campaignService.init(activeModuleConfig);
    feeService.init();


    dataAddService.init();
    dataLoader.afterInit();
}

function _initSwitchControls() {
    document.querySelectorAll("#switch-controls button").forEach(button => {
        const moduleName = button.getAttribute('data-module');
        const moduleConfig = config.MODULE[moduleName];
        if (moduleConfig) {
            button.addEventListener('click', () => {
                _setModule(_activeTab, moduleConfig);
            })
        } else {
            setKeepDisabled(button, true);
        }
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log(`onMessage: [${message.action}]`)
    const response = { action: message.action };
    try {
        log(`Processing message: [${message.action}]`);
        if (message.error) {
            showError(message.error)
        } else {
            switch(message.action) {
                case constants.WINRED_SETUP.ACTION_GET_DATA_BY_TYPE_READY:
                    dataLoader.onDataLoaded(message.dataType, message.data)
                    log(`Select populated [${message.dataType}]`);
                    break;
                case constants.WINRED_SETUP.ACTION_GET_CAMPAIGN_BY_SLUG_READY:
                    const fetchedCampaign = message.data;
                    campaignService.processCampaignStoreResponse(fetchedCampaign);
                    break;
                case constants.WINRED_SETUP.ACTION_OPERATION_PUT_DATA_READY:
                    const dataType = message.dataType;
                    const newEntry = message.data;
                    dataAddService.onDataPostedToServer(dataType, newEntry);
                    log(`Data put response processed [${dataType}]`);
                    break;
                case constants.WINRED_SETUP.ACTION_POST_UPSERT_CAMPAIGN_READY:
                    const status = message.status;
                    log(`Campaign insertion ready [${status}][${JSON.stringify(message.campaign)}]`);
                    campaignService.onCampaignInserted(message.campaign, status);
                    break;
            }

        }
        response.data = 'Success';
    } catch (exception) {
        response.error = exception;
    }
    log(`Message processed [${JSON.stringify(response)}]`)
    sendResponse(response);
})

