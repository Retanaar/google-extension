import {
    getTopContainer,
    logger, markElementWithError, selectDataKeyOptionByText,
} from "./utils.js";
import * as contentRefresher from "./generateContent.js";
import * as campaignService from "./campaignService.js";

const log = logger('FeeService');

export function init() {
    _initFeeInputFields();
}

function _initFeeInputFields() {
    _getFeeInout('one').addEventListener('blur', onFeeValueUpdated);
    _getFeeInout('two').addEventListener('blur', onFeeValueUpdated);
}

export function resetFees() {
    _getFeeInout('one').value = ''
    _getFeeInout('two').value = ''
    selectDataKeyOptionByText('feeOne', '');
    selectDataKeyOptionByText('feeTwo', '');
    selectDataKeyOptionByText('onPage', '');
    checkFeesCorrect();
}

export function checkFeesCorrect() {
    const feeOneCorrect = _isFeeCorrect('fee-one');
    const feeTwoCorrect = _isFeeCorrect('fee-two');
    markElementWithError(getTopContainer().querySelector('#winred-page-setup-fee-one-button'), !feeOneCorrect);
    markElementWithError(getTopContainer().querySelector('#winred-page-setup-fee-two-button'), !feeTwoCorrect);
    return feeOneCorrect && feeTwoCorrect;
}

function onFeeValueUpdated() {
    contentRefresher.refreshGeneratedContent();
}

function _isFeeCorrect(feeType) {
    const valueSet = getTopContainer().querySelector(`#winred-page-setup-${feeType}-input`)
        .value.trim() !== '' ;
    const modifierSet = getTopContainer().querySelector(`#winred-page-setup-${feeType}-select`)
        .value.trim() !== '';

    const bothEmpty = !valueSet && !modifierSet;
    const bothHaveValue = valueSet && modifierSet;
    return bothEmpty || bothHaveValue;
}

export function onFeeModifierChanged(modifier) {
    let feeValueField;
    if (modifier === 'feeOne') {
        feeValueField = _getFeeInout('one');
    } else if (modifier === 'feeTwo') {
        feeValueField = _getFeeInout('two');
    }

    if (feeValueField) {
        feeValueField.value = '';
    }

    checkFeesCorrect();
}

export function setFeeFromClient(client) {
    log('Updating client related fields');
    if (client) {
        _getFeeInout('one').value = _formatFee(client.fee, client.feeType);
        _getFeeInout('two').value = _formatFee(client.extraPercent, client.extraType);
        selectDataKeyOptionByText('feeOne', client.feeType);
        selectDataKeyOptionByText('feeTwo', client.extraType);
        selectDataKeyOptionByText('onPage', client.process);
    }
}

export function setFeesFromState(state) {
    log('Setting fees from state');
    const feeOneModifier = _getFeeModifier('feeOne');
    const feeTwoModifier = _getFeeModifier('feeTwo');
    _getFeeInout('one').value = _formatFee(state.feeOneValue, feeOneModifier);
    _getFeeInout('two').value = _formatFee(state.feeTwoValue, feeTwoModifier);
}

export function setFeesToState(state) {
    log('Storing fees to state');
    const feeOneValue = _getFeeInout('one').value;
    const feeTwoValue = _getFeeInout('two').value;
    const feeOneModifier = _getFeeModifier('feeOne');
    const feeTwoModifier = _getFeeModifier('feeTwo');
    state.feeOneValue = _getFeeValue(feeOneValue, feeOneModifier);
    state.feeTwoValue = _getFeeValue(feeTwoValue, feeTwoModifier);
}

function _getFeeInout(num) {
    return getTopContainer().querySelector(`#winred-page-setup-fee-${num}-input`);
}

function _getFeeModifier(dataKey) {
    const feeModifierSelect = document.querySelector(`select[data-key="${dataKey}"]`);
    const selectedIndex = feeModifierSelect.selectedIndex;
    if (selectedIndex > 0) {
        return feeModifierSelect.options[selectedIndex].text;
    }
    return '';
}

function _getFeeValue(fee, modifier) {
    if (!fee) {
        return null;
    }
    if (_isPercentFeeType(modifier)) {
        const cleanedStr = fee.replace('%', '').trim();
        const floatVal = parseFloat(cleanedStr) / 100;
        return parseFloat(floatVal.toFixed(4));
    } else {
        const cleanedStr = fee.replace('$', '').trim();
        const numberVal = parseFloat(cleanedStr);
        return parseFloat(numberVal.toFixed(3));
    }
}

function _formatFee(fee, modifier) {
    if (!fee) {
        return '';
    }
    const cleanedFee = parseFloat(fee
        .toString()
        .replace('%', '')
        .replace('$', '')
        .trim()).toFixed(4);

    if (_isPercentFeeType(modifier)) {
        return (cleanedFee * 100).toFixed(1) + "%"
    } else {
        const roundedValue = Math.round(cleanedFee * 100) / 100; // Round to two decimal places
        return roundedValue.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
}

function _isPercentFeeType(modifier) {
    switch(modifier) {
        case 'RevShare':
        case 'Placement':
            return true;
        default:
            return false;
    }
}