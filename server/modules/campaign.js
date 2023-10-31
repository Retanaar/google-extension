const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const logger = require('./logger'); // Import your custom logger
const db = require('./db');

// TODO migrate to constants
const ALLOWED_CAMPAIGNS = ['starboard', 'agency'];

const log = logger('Campaign');

router.get('/:campaignType', async (req, res,next) => {
    try {
        const campaignType = req.params.campaignType;
        const slug = req.query.slug;
        //TODO move to validation middleware
        if (!ALLOWED_CAMPAIGNS.includes(campaignType)) {
            throw {message: `Unknown campaign type [${campaignType}]`}
        }
        res.data = await _getCampaignBySlug(campaignType, slug);
        next();
    } catch (ex) {
        log.error(`Error [${ex.message}]`);
        next(ex);
    }
});

router.post('/starboard', async (req, res, next) => {
    let transaction;
    try {
        const campaignType = req.params.campaignType;
        const newInstance = req.body;
        log.info(`Creating new campaign [${campaignType}]`);
        //TODO move to validation middleware

        transaction = await db.newTransaction();

        newInstance.client = await _getStarboardClientByName(newInstance.client.name);
        newInstance.fees = await _enrichFeesWithTypeId(newInstance.fees);
        await _saveSlug(newInstance);
        const savedCampaign = await _saveCampaign(newInstance);
        await _saveFees(newInstance, savedCampaign.id);
        res.data = await _getCampaignBySlug('starboard', newInstance.slug.id);
        transaction.commit();
        next();
        log.info(`Starboard campaign saved`)
    } catch (ex) {
        log.error(`Error [${ex.message}]`);
        if (transaction) {
            transaction.rollback();
        }
        next(ex);
    }
});


// TODO remove duplicates
router.post('/agency', async (req, res, next) => {
    let transaction;
    try {
        const campaignType = req.params.campaignType;
        const newInstance = req.body;
        log.info(`Creating new campaign [${campaignType}]`);

        transaction = await db.newTransaction();

        newInstance.client = await _getAgencyClientByName(newInstance.client.name);
        newInstance.fees = await _enrichFeesWithTypeId(newInstance.fees);
        const savedCampaign = await _saveAgencyCampaign(newInstance);
        await _saveFees(newInstance, savedCampaign.id);
        res.data = await _getCampaignBySlug('agency', newInstance.slug.id);
        transaction.commit();
        next();
        log.info(`Agency campaign saved`)
    } catch (ex) {
        log.error(`Error [${ex.message}]`);
        if (transaction) {
            transaction.rollback();
        }
        next(ex);
    }
});

async function _getCampaignBySlug(campaignType, slug) {
    log.info(`Getting [${campaignType}] campaign by slug [${slug}]`);
    const campaignFunction = campaignType === 'starboard' ? _getStarboardCampaign : _getAgencyCampaign
    const campaign = await campaignFunction(slug);
    if (campaign !== null) {
        const fees = await _getCampaignFees(campaign.id);
        delete campaign.id;
        if (fees) {
            campaign.fees = fees;
        }
    } else {
        log.warn(`[${campaignType}] campaign not found for slug [${slug}]`);
    }
    return campaign;
}

async function _saveAgencyCampaign(campaign) {
    const Campaign = db.repository().Campaign;

    const newInstance = Campaign.build({
        name: campaign.name,
        baseUrl: campaign.baseUrl,
        sourceUrl: campaign.sourceUrl,
        utmSource: campaign.utmSource,
        utmMedium: campaign.utmMedium,
        utmCampaign: campaign.utmCampaign,
        utmContent: campaign.utmContent,
        agencyId: campaign.agency,
        conduitoid: campaign.client.oid,
        pageType: campaign.pageType,
        medium: campaign.medium,
        platformPid: campaign.pageId,
        agencySlug: campaign.slug.id,
        parameters: campaign.parameters
    });
    return await newInstance.save();
}

async function _saveFees(campaign, campaignId) {
    const Fee = db.repository().Fee;
    for(const fee of campaign.fees) {
        const newInstance = Fee.build({
            campaignId,
            fee: fee.fee,
            feeTypeId: fee.feeTypeId,
            onPage: fee.onPage
        })
        await newInstance.save();
    }
}

async function _saveCampaign(campaign) {
    const Campaign = db.repository().Campaign;
    const newInstance = Campaign.build({
        sourceUrl: campaign.baseUrl,
        baseUrl: campaign.baseUrl,
        utmSource: campaign.utmSource,
        utmMedium: campaign.utmMedium,
        utmCampaign: campaign.utmCampaign,
        utmContent: campaign.utmContent,
        agencyId: campaign.agency,
        conduitoid: campaign.client.oid,
        pageType: campaign.pageType,
        medium: campaign.medium,
        slugId: campaign.slug.id,
        platformPid: campaign.pageId
    });
    return await newInstance.save();
}

async function _saveSlug(campaign) {
    const Slug = db.repository().Slug;
    const newSlugInstance = Slug.build({
        id: campaign.slug.id,
        client: campaign.client.slugname,
        pageType: campaign.slug.pageType,
        agency: campaign.slug.agency,
        source: campaign.slug.source,
        campaign: campaign.slug.campaign,
        topic: campaign.slug.topic,
        medium: campaign.slug.medium,
        dateSlug: campaign.date,
        sourceCode: campaign.slug.sourceCode,
        pageName: campaign.internalName,
        conduitoid: campaign.client.oid
    });
    return await newSlugInstance.save();
}

async function _getStarboardClientByName(name) {

    const foundModel = await db.repository().ClientStarboard.findOne({ where: { name } });
    if (foundModel) {
        return foundModel.toJSON();
    }
    return null;
}

async function _getAgencyClientByName(name) {

    const foundModel = await db.repository().ClientAgency.findOne({ where: { name } });
    if (foundModel) {
        return foundModel.toJSON();
    }
    return null;
}

async function _enrichFeesWithTypeId(fees) {
    const feeShortNames = fees.map(fee => fee.feeType.shortName);
    const uniqueNames = [... new Set(feeShortNames)];
    const feeTypes = await _getFeeTypesByShortName(uniqueNames);
    if (!feeTypes || uniqueNames.length !== feeTypes.length) {
        throw {message: 'Unable to enrich fees'}
    }
    const feeTypeMapByName = feeTypes.reduce((map, obj) => {
        map[obj.shortName] = obj;
        return map;
    }, {});

    fees.forEach(fee => {
        fee.feeTypeId = feeTypeMapByName[fee.feeType.shortName].id;
    })
    return fees;
}

async function _getFeeTypesByShortName(shortNames) {
    log.info('Getting fees by ids')
    const FeeType = db.repository().FeeType;

    const foundModels = await FeeType.findAll({
        where: {
            shortName : {
                [Op.in]: shortNames
            }
        }
    });

    if (foundModels) {
        return foundModels.map(fm => fm.toJSON());
    }
    return null;
}

async function _getAgencyCampaign(slug) {
    const Campaign = db.repository().Campaign;
    const ClientAgency = db.repository().ClientAgency;

    const campaignModel = await Campaign.findOne({
        where: { agencySlug: slug },
        attributes: {exclude: ['slugId', 'conduitoid']},
        include: [
            {
                model: ClientAgency,
                as: 'clientAgency',
                required: true,
                attributes: ['oid', 'name'],
            }]
    });

    if (!campaignModel) {
        return null;
    }
    const campaign = campaignModel.toJSON();

    campaign.client = campaign.clientAgency;
    campaign.slug = {
        id: campaign.agencySlug,
    }
    delete campaign.clientAgency;
    delete campaign.agencySlug;
    return campaign;
}

async function _getStarboardCampaign(slug) {
    const Slug = db.repository().Slug;
    const Campaign = db.repository().Campaign;
    const ClientStarboard = db.repository().ClientStarboard;

    const campaignModel = await Campaign.findOne({
        where: { slugId: slug },
        attributes: {exclude: ['slugId', 'conduitoid']},
        include: [
            {
                model: Slug,
                as: 'slugData',
                required: true,
            },{
                model: ClientStarboard,
                as: 'clientStarboard',
                required: true,
                attributes: ['oid', 'name', 'slugname']
            }]
    });

    if (!campaignModel) {
        return null;
    }

    const campaign = campaignModel.toJSON();
    campaign.client = campaign.clientStarboard;
    campaign.slug = campaign.slugData;
    delete campaign.slugData;
    delete campaign.clientStarboard;
    return campaign;
}

async function _getCampaignFees(campaignId) {
    const Fee = db.repository().Fee;
    const FeeType = db.repository().FeeType;

    const fees =  await Fee.findAll({
        where: { campaignId},
        attributes: {exclude: ['id', 'campaignId', 'feeTypeId']},
        include: [
            {
                model: FeeType,
                as: 'feeType',
                required: true,
                attributes: ['shortName', 'longName', 'multiplier']
            }]
    });

    if (!fees) {
        return null;
    }

    log.info(`Found fees: [${fees.length}] `);
    return fees.map(fe => fe.toJSON());
}

module.exports = router;
