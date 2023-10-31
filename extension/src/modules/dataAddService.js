import * as utils from "./utils.js";
import * as dataStore from './localDataStore.js';
import * as dataLoader from './dataLoader.js';
import {
    constants,
    DATA_CONTROLS_CONFIG,
    getTopContainer,
    setControlsDisabled,
    setKeepDisabled,
    setStatus
} from "./utils.js";

const log = utils.logger('DataAddService');

let dialogTitle;
let dialogContent;
let addButton;
let errorText;

export function init() {
    _initModals();
    _initDataAddButtons();
}

export function onDataLoaded() {
    log(`onDataLoaded`);
    _getAllDataAddButtons().forEach(button => {
        const dataType = button.getAttribute('data-type');
        const dataTypeConfig = DATA_CONTROLS_CONFIG[dataType];

        if (!dataTypeConfig.createOptions) {
            setKeepDisabled(button, true);
        }
    });
}

export function onDataPostedToServer(dataType, newEntry) {
    log('Processing data put response');
    if (newEntry) {
        dataLoader.insertData(dataType, newEntry);
        MicroModal.close('modal-data-add');
    } else {
        _showErrorMessage();
    }
}

function _initModals() {
    MicroModal.init({
        awaitCloseAnimation: true // Add this line if you want to wait for modal to close animation to finish before executing the next code
    });
    dialogContent = document.getElementById('modal-data-add-content');
    dialogTitle = document.getElementById('modal-data-add-title');
    addButton = document.getElementById('modal_button_add');
    errorText = document.getElementById('modal-error-text');
}

function _initDataAddButtons() {
    log('Initializing data add controls')
    const buttons = _getAllDataAddButtons();
    buttons.disabled = true;
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const dataType = button.getAttribute('data-type');
            log(`Clicking Add button for type [${dataType}]`);
            const dateTypeControlConfig = DATA_CONTROLS_CONFIG[dataType];
            if (dateTypeControlConfig) {
                _initDialog(dateTypeControlConfig);
                MicroModal.show('modal-data-add');
            } else {
                throw `Unknown data type [${dataType}]`;
            }
        });
    });
    log('Data add controls initialized');
}

function _initDialog(config) {
    log(`Initializing dialog`);
    const co = config.createOptions;
    dialogTitle.textContent = `Create ${co.title}`;
    dialogContent.innerHTML = '';
    errorText.style.display = 'none';
    co.fields.forEach(fieldDef => _addFieldToDialogContent(fieldDef, dialogContent));
    _initAddButton(config);
}

function _initAddButton(createOptions) {
    const clone = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(clone, addButton);
    addButton = clone;
    addButton.addEventListener('click', () => _onEntryAdd(createOptions));
}

function _addFieldToDialogContent(fieldDef, content) {
    const label = document.createElement('label');
    const inputId = `field_${fieldDef.name}`
    label.for = `${inputId}`;
    label.textContent = fieldDef.label;
    content.append(label);
    let input;
    switch (fieldDef.type) {
        case 'string':
            input = document.createElement('input');
            input.type = 'text';
            input.id = inputId;
            break;
        default:
            throw `Unknown field type [${fieldDef.type}]`;
    }

    content.append(input);
}

function _onEntryAdd(createConfig) {
    const entry = _createEntryFromDialog(createConfig.createOptions);
    const dataType = createConfig.dataType;
    if (!_isUnique(createConfig.dataType, entry)) {
        _showErrorMessage();
        return;
    }
    setControlsDisabled(true);
    setStatus('Storing data ...');
    chrome.runtime.sendMessage(
        {action: constants.WINRED_SETUP.ACTION_OPERATION_PUT_DATA, dataType, entry},
        (response) => {});
}

function _showErrorMessage() {
    errorText.textContent = 'One or more fields are non-unique';
    errorText.style.display = 'block';
}

function _isUnique(dataType, newEntry) {
    const storedData = dataStore.getDataTypeData(dataType);
    const properties = Object.keys(newEntry);
    for (let entry of Object.values(storedData)) {
        for(let property of properties) {
            if (newEntry[property] === entry[property]) {
                return false;
            }
        }
    }
    return true;
}

function _createEntryFromDialog(createConfig) {
    const object = {};
    createConfig.fields.forEach(fieldDef => {
        switch (fieldDef.type) {
            case 'string':
                const input = document.getElementById(_getIdForField(fieldDef));
                object[fieldDef.name] = input.value.trim();
                break;
        }
    });
    return object;
}

function _getIdForField(fieldDef) {
    return `field_${fieldDef.name}`;
}

function _getAllDataAddButtons() {
    return getTopContainer().querySelectorAll('button[data-type][data-action="add"]');
}