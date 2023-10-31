const logger = require("../../modules/logger");
const agencyService = require("./agency.service");
const feeService = require("../fees/fees.service");
const CampaignController = require("../campaign.controller");

const log = logger("Agency Campaign");
class AgencyController extends CampaignController {
    async  getCampaign(req, res, next) {
        try {
            const slug = req.query.slug;
            log.info(`Getting [agency] campaign by slug [${slug}]`);

            let campaign = await agencyService.getAgencyCampaignBySlug(slug);

            if (campaign) {
                campaign = await this.addFeeToCampaign(campaign);
            } else {
                log.warn(`[agency] campaign not found for slug [${slug}]`);
            }
            res.data = campaign;
            next();
        }
        catch (ex) {
            log.error(`Error [${ex.message}]`);
            next(ex);
        }
    }
    async saveCampaign(req, res, next) {
        try {
            const newInstance = req.body;
            log.info(`Creating new campaign [agency]`);

            await this.openTransaction();

            newInstance.client = await agencyService.getAgencyClientByName(newInstance.client.name);
            newInstance.fees = await feeService.enrichFeesWithTypeId(newInstance.fees);

            const savedCampaign = await agencyService.saveAgencyCampaign(newInstance);
            await feeService.saveFees(newInstance, savedCampaign.id);
            res.data = await agencyService.getAgencyCampaignBySlug(newInstance.slug.id);

            await this.commitTransaction()
            next();

            log.info(`Agency campaign saved`)
        } catch (ex) {
            log.error(`Error [${ex.message}]`);
            await this.rollbackTransaction();
            next(ex);
        }
    }
}

module.exports = new AgencyController();