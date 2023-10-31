import {getTopContainer} from "./utils.js";

export const UTM = {
    SOURCE: 'source',
    MEDIUM: 'medium',
    CAMPAIGN: 'campaign',
    CONTENT: 'content',
}

export function getUtmValue(utmType) {
    return _getUtmElement(utmType).value;
}

export function restoreState(state) {
    setUtmValue(UTM.SOURCE,state.utmSource);
    setUtmValue(UTM.MEDIUM,state.utmMedium);
    setUtmValue(UTM.CAMPAIGN,state.utmCampaign);
    setUtmValue(UTM.CONTENT,state.utmContent);
}

export function reset() {
    setUtmValue(UTM.SOURCE, '');
    setUtmValue(UTM.MEDIUM, '');
    setUtmValue(UTM.CAMPAIGN, '');
    setUtmValue(UTM.CONTENT, '');
}

export function setUtmValue(field, value) {
    _getUtmElement(field).value = value;
}

function _getUtmElement(utmType) {
    return getTopContainer().querySelector(`#winred-page-setup-utms-${utmType}`);
}
