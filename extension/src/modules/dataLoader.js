import {
    setControlsDisabled,
    setStatus,
    getAllDataTypedSelects,
    logger,
    constants,
    getSelectedClient,
    selectDataKeyOptionByText, markElementWithError, DATA_CONTROLS_CONFIG, getTopContainer
} from "./utils.js";
import * as contentGenerator from './generateContent.js';
import * as localDataStore from './localDataStore.js';
import * as feeService from "./feeService.js";
import * as utmService from "./utmMarkersService.js";
import * as dataAddService from "./dataAddService.js";

const log = logger('DataLoader');

let _refreshRequestCounter = 0;
let _isFullRefresh = false;
let _moduleConfig;

export function init(moduleConfig) {
    _moduleConfig = moduleConfig;
    _initDataTypedSelects();
    _initDataRefreshButtons();
    _initResetButton();
    _updateClientFields();
}

export function afterInit() {
    _restoreState();
    _tryRefreshData();
}

export function insertData(dataType, newEntry) {
    log(`Inserting new entry [${JSON.stringify(newEntry)}]`)
    const state = localDataStore.getStoredState();
    const optionsArray = _dataObjToArray(dataType, newEntry);
    state[dataType] = optionsArray[0];
    localDataStore.storeState(state);
    const data = localDataStore.getDataTypeData(dataType);
    data.push(newEntry);
    onDataLoaded(dataType, data);
}
export function onDataLoaded(dataType, data) {
    localDataStore.storeDataTypeData(dataType, data);
    _initDataTypedSelect(dataType);
    _restoreState();
    dataAddService.onDataLoaded();

    if (_isFullRefresh) {
        _refreshRequestCounter--;
        if (_refreshRequestCounter > 0) {
            setStatus(`Refreshing data ..... ${_refreshRequestCounter}`);
            setControlsDisabled(true);
            return;
        } else {
            _isFullRefresh = false;
        }
    }
    setStatus('Refreshing complete');
    setControlsDisabled(false);
}

export function resetState(data) {
    localDataStore.storeState(data);
    _restoreState();
}

export function checkSelectsValid(checkList) {
    const container = getTopContainer().querySelector(`#winred-page-setup-controls`);
    const selects = container.querySelectorAll('select[data-type]');
    let selectsValid = true;
    selects.forEach(dataTypeSelect => {
        const dataType = dataTypeSelect.getAttribute('data-type');
        const button = container.querySelector(`button[data-type="${dataType}"][data-action="load"]`);
        if (checkList.includes(dataType)) {
            const isEmpty = dataTypeSelect.selectedIndex < 1;
            selectsValid &= !isEmpty;
            markElementWithError(button, isEmpty);
        }
    })
    return selectsValid;
}

function _tryRefreshData() {
    if (_hasEmptyDataSelects()) {
        log('No state value found, requesting full data refresh');
        setControlsDisabled(true);
        _requestFullDataRefresh();
    }
}

function _hasEmptyDataSelects() {
    for(const dataType of _moduleConfig.dataTypes) {
        if (localDataStore.getDataTypeData(dataType) === null) {
            return true;
        }
    }
    return false;
}

function _initResetButton() {
    getTopContainer().querySelector('#winred-page-setup-reset-data').addEventListener('click', () => {
        log(`Resetting form`);
        _resetForm();
    });
    log('Reset button initialized');
}

function _resetForm() {
    setStatus('Resetting ....');
    getAllDataTypedSelects().forEach(dataTypeSelect => {
        const dataKey = dataTypeSelect.getAttribute('data-key');
        selectDataKeyOptionByText(dataKey, '');
    });

    feeService.resetFees();
    utmService.reset();

    selectDataKeyOptionByText(constants.DATA.AGENCY, 'Starboard');
    selectDataKeyOptionByText(constants.DATA.PAGE_TYPE, 'Donation');
    contentGenerator.reset();
    setStatus('Reset complete');
}

function _initDataRefreshButtons() {
    const buttons = getTopContainer().querySelectorAll(`button[data-type][data-action="load"]`);
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const dataType = button.getAttribute('data-type');
            _requestDataRefresh(dataType);
        });
    });

    getTopContainer().querySelector('#winred-page-setup-refresh-all-btn')
        .addEventListener('click', _requestFullDataRefresh);
    log('Listeners initialized');
}

function _requestFullDataRefresh() {
    log('Sending data refresh for all data types');
    const dataTypes = _moduleConfig.dataTypes;
    _refreshRequestCounter = dataTypes.length;
    _isFullRefresh = true;
    dataTypes.forEach(dataType => {
        _requestDataRefresh(dataType);
    })
}

function _requestDataRefresh(dataType) {
    log(`Sending data refresh for data type: [${dataType}] `);
    setControlsDisabled(true);
    setStatus('Refreshing data ...');
    chrome.runtime.sendMessage({action: constants.WINRED_SETUP.ACTION_GET_DATA_BY_TYPE, dataType }, (response) => {});
}

function _initDataTypedSelects() {
    log(`Populating selects`);
    _moduleConfig.dataTypes.forEach(dataType => _initDataTypedSelect(dataType));
    log('Selects populated');
}

function _initDataTypedSelect(dataType) {
    log(`Populating data for select: [${dataType}]`);
    _getSelectsForDataType(dataType).forEach(select => {
        log(`Found [${dataType}] select`);
        select.innerHTML = '';
        const data = _getDataTypeDataFromStorage(dataType);
        const dataKey = select.getAttribute('data-key');
        const selectNoListeners = select.cloneNode(true);
        select.parentNode.replaceChild(selectNoListeners, select);
        selectNoListeners.addEventListener('change', () => _onDataTypedSelectChange(dataType, dataKey));
        if (data) {
            const defaultOption = new Option('', '');
            selectNoListeners.appendChild(defaultOption);
            data.forEach(optionArr => {
                const option = new Option(optionArr[0], optionArr[1]);
                selectNoListeners.appendChild(option);
            });
        }
    });
}

function _getDataTypeDataFromStorage(dataType) {
    const savedData = localDataStore.getDataTypeData(dataType);
    let data = [];
    if (savedData) {
        data = _dataToArray(dataType, savedData);
        log(`Data found in local storage [${dataType}]`);
    } else {
        log(`No data found in local storage [${dataType}]`);
    }
    return data;
}

function _onDataTypedSelectChange(dataType, dataKey) {
    if (dataType === constants.DATA.CLIENT || dataType === constants.DATA.AGENCY_CLIENT) {
        _updateClientFields();
    } else if (dataType === constants.DATA.FEE) {
        feeService.onFeeModifierChanged(dataKey);
    }

    contentGenerator.refreshGeneratedContent();
}

function _updateClientFields() {
    log('Updating client related fields');
    const client = getSelectedClient();
    feeService.setFeeFromClient(client);
}
function _restoreState() {
    const state = localDataStore.getStoredState();
    if (state) {
        getAllDataTypedSelects().forEach(dataTypeSelect => {
            const dataKey = dataTypeSelect.getAttribute('data-key');
            if (state[dataKey]) {
                selectDataKeyOptionByText(dataKey, state[dataKey]);
            }
        })
        feeService.setFeesFromState(state)
        utmService.restoreState(state);
        contentGenerator.restoreState(state);
        dataAddService.onDataLoaded();
    }
    contentGenerator.refreshGeneratedContent();
}

function _getSelectsForDataType(dataType) {
    return getTopContainer().querySelectorAll(`select[data-type="${dataType}"]`) || [];
}

function _dataToArray(dataType, dataObjects) {
    return dataObjects
        .map(dataObject => _dataObjToArray(dataType, dataObject))
        .sort((a,b) => a[0].localeCompare(b[0], "en-US", { sensitivity: "base" }));
}

function _dataObjToArray(dataType, dataObject) {
    const config = DATA_CONTROLS_CONFIG[dataType];
    if (config) {
        const first = config.selectOptionsProperties[0];
        const second = config.selectOptionsProperties[1];
        return [dataObject[first], dataObject[second]];
    }
    throw `Unknown data type [${dataType}]`;
}



