
import {
    constants,
    logger,
    settings
} from "./modules/utils.js";
import {MODULE} from "./config.js";


let _BASE_URL;

const log = logger('Background');

chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    log(`Processing message [${message.action}]`);

    switch (message.action) {
        case constants.WINRED_SETUP.INIT_URL_BY_ENVIRONMENT:
            _BASE_URL = _createWorkingUrl(message.data.env);
            log("_BASE_URL: " + _BASE_URL);
            break;
        case constants.WINRED_SETUP.ACTION_GET_DATA_BY_TYPE:
            const dataType = message.dataType;
            _getDataByType(dataType, (data, error) => {
                chrome.runtime.sendMessage({action: constants.WINRED_SETUP.ACTION_GET_DATA_BY_TYPE_READY, data, dataType});
            })
            break;
        case constants.WINRED_SETUP.ACTION_POST_UPSERT_CAMPAIGN:
            const campaignType = message.campaignType;
            _addNewCampaign(message.campaignType, message.campaign, (data, error) => {
                chrome.runtime.sendMessage({action: constants.WINRED_SETUP.ACTION_POST_UPSERT_CAMPAIGN_READY,
                    status: 'ready',
                    campaignType, campaign: data, error});
            })
            break;
        case constants.WINRED_SETUP.ACTION_GET_CAMPAIGN_BY_SLUG:
            _getCampaignBySlug(message.campaignType, message.slug, (data, error) => {
                chrome.runtime.sendMessage({action: constants.WINRED_SETUP.ACTION_GET_CAMPAIGN_BY_SLUG_READY, data, error});
            })
            break;
        case constants.WINRED_SETUP.ACTION_OPERATION_PUT_DATA:
            const putDataType = message.dataType;
            const newEntry = message.entry;
            _putData(putDataType, newEntry, (data, error) => {
                chrome.runtime.sendMessage({action: constants.WINRED_SETUP.ACTION_OPERATION_PUT_DATA_READY,
                    data, error, dataType: putDataType});
            })
            break;
    }
    return true;
})

function _createWorkingUrl(env) {
    return settings.ENVS.VALUES[env];
}

function _putData(dataType, entry, callback) {
    log(`Pushing data entry to backend: [${dataType}]`);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
    };
    fetch(_buildUrlDataPut(dataType), options)
        .then(r => r.json())
        .then(responseJson => _processAPIResponse(responseJson, callback))
        .catch(error => callback('', error))
    log(`Putting data complete: [${dataType}]`);
}

function _getCampaignBySlug(campaignType, slug, callback) {
    log(`Getting campaign by slug: [${campaignType}][${slug}]`);
    const campaignBuilder = campaignType === MODULE.Agency.name ? new AgencyCampaignBuilder() : new CampaignBuilder();
    fetch(_buildUrlGetCampaignBySlug(campaignType, slug))
        .then(r => r.json())
        .then(responseJson => _processCampaignAPIResponse(campaignType, responseJson, callback))
        .catch(error => {
            callback('', error);
        });
}

function _addNewCampaign(campaignType, campaign, callback) {
    log(`Pushing slug entry to backend: [${campaign.slug}]`);
    const campaignBuilder = campaignType === MODULE.Agency.name ? new AgencyCampaignBuilder() : new CampaignBuilder();
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignBuilder.campaignToApiCampaign(campaign))
    };
    fetch(_buildUrlUpsertCampaign(campaignType), options)
        .then(r => r.json())
        .then(responseJson => _processCampaignAPIResponse(campaignType, responseJson, callback))
        .catch(error => callback('', error))
    log(`Pushing complete: [${campaign.slug}]`);
}

function _getDataByType(dataType, callback) {
    log(`_getDataByType: [${dataType}]`);
    fetch(_buildUrlGetDataByType(dataType))
        .then(r => r.json())
        .then(r => _processAPIResponse(r, callback))
        .catch(error => {
            callback('', error);
        });
}

function _processCampaignAPIResponse(campaignType, response, callback) {
    log(`Processing Campaign API response [${campaignType}][success = ${response.success}]`);
    const campaignBuilder = campaignType === MODULE.Agency.name ? new AgencyCampaignBuilder() : new CampaignBuilder();
    if (response.success) {
        const campaign = campaignBuilder.apiCampaignToCampaign(response.data);
        log(`Campaign processed [${JSON.stringify(campaign)}]`);
        callback(campaign);
    } else {
        callback(response.error, response.data);
    }
    return true;
}

function _processAPIResponse(response, callback) {
    log(`Processing API response [success = ${response.success}]`);
    if (response.success) {
        callback(response.data);
    } else {
        callback(response.error, response.data);
    }
    return true;
}

export function _buildUrlDataPut(dataType) {
    return new URL(['vocabulary', dataType].join('/'),_BASE_URL).toString();
}
export function _buildUrlGetCampaignBySlug(campaignType, slug) {
    const url =  new URL(['campaign', campaignType.toLowerCase()].join('/'), _BASE_URL);
    url.searchParams.append('slug', slug);
    return url.toString();
}

export function _buildUrlUpsertCampaign(campaignType) {
    return new URL(['campaign', campaignType.toLowerCase()].join('/'), _BASE_URL).toString();
}

export function _buildUrlGetDataByType(dataType) {
    return new URL(['vocabulary', dataType.toLowerCase(), 'all'].join('/'),_BASE_URL).toString();
}

class CampaignBuilder {

    campaignToApiCampaign(campaign) {
    }

    apiCampaignToCampaign(apiCampaign) {}
    static buildFee(feeType, feeValue, onPage) {
        return {
            fee: feeValue,
            feeType: {
                shortName: feeType
            },
            onPage: onPage
        }
    }
}

class AgencyCampaignBuilder extends CampaignBuilder {

    campaignToApiCampaign(campaign) {
        const apiCampaign = Object.assign({}, campaign);
        apiCampaign.client = {
            name: campaign.client
        }
        apiCampaign.pageId = campaign.pageRevvUID;
        apiCampaign.slug = {
            id: campaign.slug,
            date: campaign.date
        }
        apiCampaign.fees = [];

        if (campaign.feeOne) {
            apiCampaign.fees.push(CampaignBuilder.buildFee(campaign.feeOne, campaign.feeOneValue, campaign.onPage));
        }

        if (campaign.feeTwo) {
            apiCampaign.fees.push(CampaignBuilder.buildFee(campaign.feeTwo, campaign.feeTwoValue, campaign.onPage));
        }
        delete apiCampaign.pageRevvUID;
        return apiCampaign;
    }

    apiCampaignToCampaign(apiCampaign) {
        let campaign = null;
        if (apiCampaign) {
            campaign = Object.assign({}, apiCampaign);
            campaign.pageRevvUID = apiCampaign.platformPid;
            campaign.client = apiCampaign.client.name;
            campaign.slug = apiCampaign.slug.id;
            if (apiCampaign.fees && apiCampaign.fees.length > 0) {
                campaign.feeOne = apiCampaign.fees[0].feeType.shortName;
                campaign.feeOneValue = parseFloat(apiCampaign.fees[0].fee);
                campaign.onPage = apiCampaign.fees[0].onPage;

                if (apiCampaign.fees.length > 1) {
                    campaign.feeTwo = apiCampaign.fees[1].feeType.shortName;
                    // TODO fix this hack, check server API
                    campaign.feeTwoValue = parseFloat(apiCampaign.fees[1].fee);
                }
            }
        }
        return campaign;
    }
}
