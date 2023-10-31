import * as localDataStore from "./localDataStore.js";

const PAGE_EDIT_REGEX = /^https:\/\/portal\.winred\.com\/rv_org_.*\/pages\/my-pages\/rv_page_.*/;

export const constants = {
    WINRED_SETUP: {
        ACTION_GET_DATA_BY_TYPE: 'getDataByType',
        ACTION_GET_DATA_BY_TYPE_READY: 'getDataByTypeReady',
        ACTION_GET_ALL_DATA: 'getAllData',
        ACTION_GET_ALL_DATA_READY: 'getAllDataReady',
        ACTION_GET_CAMPAIGN_BY_SLUG: 'getCampaign',
        ACTION_GET_CAMPAIGN_BY_SLUG_READY: 'getCampaignReady',
        ACTION_POST_UPSERT_CAMPAIGN: 'upsertCampaign',
        ACTION_POST_UPSERT_CAMPAIGN_READY: 'upsertCampaignReady',
        ACTION_OPERATION_PUT_DATA: 'putData',
        ACTION_OPERATION_PUT_DATA_READY: 'putDataReady',
        ACTION_SET_PAGE_DETAILS: 'setPageDetails',
        ACTION_GET_IDs_FROM_PAGE: 'getIdsFromPage',
        CURRENT_STATE_KEY: 'stateComposite',
        ATTRIBUTE_KEEP_DISABLED: 'keep-disabled',
        CSS_CLASS_ERROR: 'input-error'
    },
    DATA: {
        CLIENT: 'clientStarboard',
        AGENCY_CLIENT: 'clientAgency',
        AGENCY: 'agency',
        PAGE_TYPE: 'pageType',
        SOURCE: 'source',
        MEDIUM: 'medium',
        CAMPAIGN: 'campaign',
        ISSUE_TOPIC: 'topic',
        FEE: 'fee',
        ON_PAGE: 'onPage'
    },
    CONTAINER: 'popup-content'
}

export const settings = {
    ENVS: {
        DATA: 'settings',
        ID: 'settings-env',
        VALUES: {
            STAGE: 'https://geometric-bay-398416.uw.r.appspot.com',
            PRODUCTION: 'https://google.com',
        },
        SELECT: ['STAGE', 'PRODUCTION'],
        BY_DEFAULT: 'STAGE',
    }
}

const _NAME_CODE_FIELDS = [
    {
        label: 'Name',
        name: 'name',
        type: 'string'
    },
    {
        label: 'Code',
        name: 'code',
        type: 'string'
    }
];

export const DATA_CONTROLS_CONFIG = {
    [constants.DATA.AGENCY_CLIENT]: {
        dataType: constants.DATA.AGENCY_CLIENT,
        selectOptionsProperties: ['name', 'oid'],
        createOptions: null,
    },
    [constants.DATA.CLIENT]: {
        dataType: constants.DATA.CLIENT,
        selectOptionsProperties: ['name', 'slugname'],
        createOptions: null,
    },
    [constants.DATA.AGENCY]: {
        dataType: constants.DATA.AGENCY,
        selectOptionsProperties: ['name', 'code'],
        createOptions: {
            title: 'Agency',
            fields: _NAME_CODE_FIELDS,
        }
    },
    [constants.DATA.PAGE_TYPE]: {
        dataType: constants.DATA.PAGE_TYPE,
        selectOptionsProperties: ['name', 'code'],
        createOptions: {
            title: 'Page type',
            fields: _NAME_CODE_FIELDS,
        }
    },
    [constants.DATA.SOURCE]: {
        dataType: constants.DATA.SOURCE,
        selectOptionsProperties: ['name', 'code'],
        createOptions: {
            title: 'Source',
            fields: _NAME_CODE_FIELDS,
        }
    },
    [constants.DATA.MEDIUM]: {
        dataType: constants.DATA.MEDIUM,
        selectOptionsProperties: ['name', 'code'],
        createOptions: {
            title: 'Medium',
            fields: _NAME_CODE_FIELDS,
        }
    },
    [constants.DATA.CAMPAIGN]: {
        dataType: constants.DATA.CAMPAIGN,
        selectOptionsProperties: ['name', 'code'],
        createOptions: {
            title: 'Campaign',
            fields: _NAME_CODE_FIELDS,
        }
    },
    [constants.DATA.ISSUE_TOPIC]: {
        dataType: constants.DATA.ISSUE_TOPIC,
        selectOptionsProperties: ['name', 'code'],
        createOptions: {
            title: 'Issue/Topic',
            fields: _NAME_CODE_FIELDS,
        }
    },
    [constants.DATA.FEE]: {
        dataType: constants.DATA.FEE,
        selectOptionsProperties: ['shortName', 'longName'],
        createOptions: null,
    },
    [constants.DATA.ON_PAGE]: {
        dataType: constants.DATA.ON_PAGE,
        selectOptionsProperties: ['id', 'id'],
        createOptions: null,
    },
}

export function getTopContainer() {
    return document.getElementById(constants.CONTAINER);
}
export function setTemplate(templateId) {
    const popupContent = document.getElementById(constants.CONTAINER);
    popupContent.innerHTML = document.getElementById(templateId).innerHTML;
}

export function showError(error) {
    setStatus(`Error - [${JSON.stringify(error)}]`);
}

export function setStatus(status) {
    const pageUrlElement = document.getElementById('status-field');
    pageUrlElement.textContent = status;
}

export function setControlsDisabled(disabled = true) {
    const controls = document.querySelectorAll(`#${constants.CONTAINER} input, select, button`);
    controls.forEach(control => {
        if (_isKeepDisabled(control)) {
            control.disabled = true;
        } else {
            control.disabled = disabled;
        }
    });
}

export function isEditPage(url) {
    return PAGE_EDIT_REGEX.test(url);
}

export function setKeepDisabledById(elementId, keepDisabled) {
    const element = getTopContainer().querySelector(`#${elementId}`);
    setKeepDisabled(element, keepDisabled)
}

export function setKeepDisabled(element, keepDisabled) {
    element.disabled = keepDisabled;
    if (element) {
        if (keepDisabled) {
            element.setAttribute(constants.WINRED_SETUP.ATTRIBUTE_KEEP_DISABLED, keepDisabled + '');
        } else {
            element.removeAttribute(constants.WINRED_SETUP.ATTRIBUTE_KEEP_DISABLED);
        }
    }
}

function _isKeepDisabled(element) {
    return element.getAttribute(constants.WINRED_SETUP.ATTRIBUTE_KEEP_DISABLED);
}

export function extractValues() {
    const extractedValues = {};
    getAllDataTypedSelects().forEach(dataTypeSelect => {
        const dataKey = dataTypeSelect.getAttribute('data-key');
        extractedValues[dataKey] = ['', ''];
        const selectedIndex = dataTypeSelect.selectedIndex;
        if (selectedIndex > 0) {
            const selectedOption = dataTypeSelect.options[selectedIndex];
            extractedValues[dataKey] = [selectedOption.text, selectedOption.value]
        }
    })
    return extractedValues;
}

function _getCurrentDate() {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}

export function toPlainExtractedObjectByIndex(extractedValues, idx) {
    const plainObject = {};
    getAllDataTypedSelects().forEach(dataTypeSelect => {
        const dataKey = dataTypeSelect.getAttribute('data-key');
        plainObject[dataKey] = extractedValues[dataKey][idx];
    })
    plainObject.date = _getCurrentDate();
    return plainObject;
}

export function getAllDataTypedSelects() {
    return document.querySelectorAll(`#${constants.CONTAINER} select[data-key]`) || [];
}

export function markElementWithError(element, hasError) {
    if (hasError) {
        element.classList.add(constants.WINRED_SETUP.CSS_CLASS_ERROR);
    } else {
        element.classList.remove(constants.WINRED_SETUP.CSS_CLASS_ERROR);
    }
}

export function logger(label = ' ') {
    return (message) => {
        console.log(`[Starboard][${label}] ${message}`);
    }
}

export function getSelectedClient() {
    const clientSelect = document.querySelector(`#${constants.CONTAINER} select[data-key='client']`);
    if (clientSelect) {
        const dataType = clientSelect.getAttribute('data-type');
        const selectedIndex = clientSelect.selectedIndex;
        if (selectedIndex > 0) {
            const selectedOption = clientSelect.options[selectedIndex];
            const clientName = selectedOption.text;
            return localDataStore.getDataTypeData(dataType).find(client => client.name === clientName);
        }
    }
    return null;
}

export function selectDataKeyOptionByText(dataKey, text) {
    const selectElement = document.querySelector(`#${constants.CONTAINER} select[data-key="${dataKey}"]`);
    if (!text) {
        text = '';
    }
    if (selectElement) {
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].textContent === text) {
                selectElement.options[i].selected = true;
                break; // No need to continue iterating
            }
        }
    }
}

export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

export function fullElementId(id, prefix='') {
    if (prefix) {
        return `#${constants.CONTAINER} ${prefix}-${id}`;
    }
    return `#${constants.CONTAINER} ${id}`;
}

export function URLJoin(...args) {
    return args
        .join('/')
        .replace(/[\/]+/g, '/')
        .replace(/^(.+):\//, '$1://')
        .replace(/^file:/, 'file:/')
        .replace(/\/(\?|&|#[^!])/g, '$1')
        .replace(/\?/g, '&')
        .replace('&', '?');
}
