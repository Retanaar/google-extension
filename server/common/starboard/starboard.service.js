const db = require("../../modules/db");
const logger = require("../../modules/logger");

const log = logger("Starboard Campaign");

class StarboardService {
    async getStarboardCampaign(slug) {
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
    async  getStarboardClientByName(name) {

        const foundModel = await db.repository().ClientStarboard.findOne({ where: { name } });
        if (foundModel) {
            return foundModel.toJSON();
        }
        return null;
    }
    async  saveSlug(campaign) {
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
    async saveCampaign(campaign) {
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
}

module.exports = new StarboardService();