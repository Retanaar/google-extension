import {
    constants, getTopContainer,
    isEditPage,
    logger,
    setControlsDisabled,
    setKeepDisabled,
    setKeepDisabledById,
    setStatus
} from "./utils.js";
import {refreshGeneratedContent} from "./generateContent.js";

const log = logger('EditPageUpdater');

export function init(activeTab) {
    _initPushButton();
    if (!isEditPage(activeTab.url)) {
        setKeepDisabledById('winred-page-setup-push-generated-data', true);
    }
}

export function setEditPageDetails(internalName, slug, publicName, sourceCode) {
    log('Setting page details data');
    _setInputValue('internalName', internalName);
    _setInputValue('slug', slug);
    _setInputValue('publicTitle', publicName);
    _setInputValue('sourceCode', sourceCode);
}

function _initPushButton() {
    getTopContainer().querySelector('#winred-page-setup-push-generated-data').addEventListener('click', () => {
        log('Pushing data to page');
        setStatus('Pushing data ...');
        setControlsDisabled(true);
        const generatedContent = refreshGeneratedContent();
        _sendPageDetailsMessage(generatedContent);
        setControlsDisabled(false);
    });
    log('Push button initialized');
}

function _sendPageDetailsMessage(pageDetails) {
    log('Sending "setPageDetails"');
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        log('Sending "setPageDetails" chrome.tabs.query');
        chrome.tabs.sendMessage(activeTab.id, {action: constants.WINRED_SETUP.ACTION_SET_PAGE_DETAILS, data:pageDetails}, function(response) {
            log('Page details has been set');
            setStatus('Completed');
        });
    });
}

function _setInputValue(inputName, value) {
    // Find the input element by its name attribute
    const inputElement = document.querySelector(`input[name="${inputName}"]`);

    if (inputElement) {
        // Set the value of the input element
        inputElement.value = value;
    } else {
        log(` Input element with name [${inputName}] not found.`);
    }
}
