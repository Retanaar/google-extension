import {logger, constants} from "./utils.js";

const log = logger('LocalDataStore');

let _moduleConfig;

export function init(moduleConfig) {
    _moduleConfig = moduleConfig;
    const composite = _getCompositeState();
    composite.active = _moduleConfig.name;
    _saveCompositeState(composite);
}

export function getActiveModule() {
    return _getCompositeState().active;
}

export function getDataTypeData(dataType) {
    const savedData = localStorage.getItem(dataType);
    if (savedData) {
        log(`Data found in local storage [${dataType}]`);
        return JSON.parse(savedData);
    }
    return null;
}

export function storeDataTypeData(dataType, content) {
    log(`Storing stored content for data type [${dataType}]`);
    localStorage.setItem(dataType, JSON.stringify(content));
}

export function getStoredState() {
    return _getCompositeState()[_moduleConfig.name];
}

export function storeState(state) {
    log(`Storing state [${JSON.stringify(state)}]`);
    const composite = _getCompositeState();
    composite[_moduleConfig.name] = state;
    _saveCompositeState(composite);
}

function _getCompositeState() {
    const stateString = localStorage.getItem(constants.WINRED_SETUP.CURRENT_STATE_KEY);
    if (stateString) {
        return JSON.parse(stateString);
    }
    return {};
}

function _saveCompositeState(state) {
    localStorage.setItem(constants.WINRED_SETUP.CURRENT_STATE_KEY, JSON.stringify(state))
}


function _isEmptyState(state) {
    for (const value of Object.values(state)) {
        if (value) {
            return false
        }
    }
    return true;
}
