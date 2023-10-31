const db = require("../../modules/db");
const logger = require("../../modules/logger");
const { Op } = require('sequelize');

const log = logger("Fees");

class FeesService {
    async getCampaignFees(campaignId) {
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
    async enrichFeesWithTypeId(fees) {
        const feeShortNames = fees.map(fee => fee.feeType.shortName);
        const uniqueNames = [... new Set(feeShortNames)];
        const feeTypes = await this._getFeeTypesByShortName(uniqueNames);
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
    async saveFees(campaign, campaignId) {
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
    async _getFeeTypesByShortName(shortNames) {
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

}

module.exports = new FeesService();