const starboardService = require("./starboard.service");
const feeService = require("../fees/fees.service");
const logger = require("../../modules/logger");
const CampaignController = require("../campaign.controller");

const log = logger("Starboard Campaign");

class StarboardController extends CampaignController {
    async  getCampaign(req, res, next) {
        try {
            const slug = req.query.slug;
            log.info(`Getting [starboard] campaign by slug [${slug}]`);

            let campaign = await starboardService.getStarboardCampaign(slug);
            log.info(campaign);
            if (campaign) {
                campaign = await this.addFeeToCampaign(campaign);
            } else {
                log.warn(`[starboard] campaign not found for slug [${slug}]`);
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
            log.info(`Creating new campaign [starboard]`);

            await this.openTransaction();
            newInstance.client = await starboardService.getStarboardClientByName(newInstance.client.name);
            newInstance.fees = await feeService.enrichFeesWithTypeId(newInstance.fees);

            await starboardService.saveSlug(newInstance);
            const savedCampaign = await starboardService.saveCampaign(newInstance);

            await feeService.saveFees(newInstance, savedCampaign.id);
            res.data = await starboardService.getStarboardCampaign(newInstance.slug.id);
            await this.commitTransaction();
            next();
            log.info(`Starboard campaign saved`)
        } catch (ex) {
            log.error(`Error [${ex.message}]`);
            await this.rollbackTransaction();
            next(ex);
        }
    }

}

module.exports = new StarboardController()