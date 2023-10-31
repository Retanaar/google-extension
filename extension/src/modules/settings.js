import { resetState } from "./dataLoader.js";
import { getDataTypeData, storeDataTypeData } from "./localDataStore.js";
import { getTopContainer, constants, settings } from "./utils.js";


export function init() {
    _initEnvironmentsSelect();
    _initEnvironmentsButton();
}

export function currentEnvironment() {
    const settingsValues = getDataTypeData(settings.ENVS.DATA);
    return settingsValues ? settingsValues.env : settings.ENVS.BY_DEFAULT;
}

export function addEnvironmentToTemplate() {
    document.querySelector("body").className = "env-" + currentEnvironment().toLowerCase();
}

function _initEnvironmentsSelect() {
    const currentEnv = currentEnvironment();
    settings.ENVS.SELECT.forEach(env => {

        const option = new Option(env, env, undefined, currentEnv === env);
        _getEnvironmentElement("select").appendChild(option);
    })
}

function _initEnvironmentsButton() {
    _getEnvironmentElement('button').addEventListener('click', () => {
        if (getDataTypeData(settings.ENVS.DATA).env !== _getEnvironmentElement("select").value) {
            localStorage.clear();
            storeDataTypeData(settings.ENVS.DATA, {
                env: _getEnvironmentElement("select").value
            });
            addEnvironmentToTemplate();
            _refreshDataWithNewEnv(_getEnvironmentElement("select").value);
        }
    });
}

function _getEnvironmentElement(element) {
    const selector = `#${settings.ENVS.ID} ${element}`;
    return getTopContainer().querySelector(selector);
}

function _refreshDataWithNewEnv(env) {
    chrome.runtime.sendMessage({
        action: constants.WINRED_SETUP.INIT_URL_BY_ENVIRONMENT,
        data: { env }
    });
}

