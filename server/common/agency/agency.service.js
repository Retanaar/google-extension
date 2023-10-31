const db = require("../../modules/db");

class AgencyService {

    async  getAgencyCampaignBySlug(slug) {
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
    async getAgencyClientByName(name) {

        const foundModel = await db.repository().ClientAgency.findOne({ where: { name } });
        if (foundModel) {
            return foundModel.toJSON();
        }
        return null;
    }
    async saveAgencyCampaign(campaign) {
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
}

module.exports = new AgencyService();