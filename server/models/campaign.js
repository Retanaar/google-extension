const {DataTypes, Model } = require('sequelize');
class Campaign extends Model {

    static tableName() {
        return 'campaign'
    }

    static fields() {
        return {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'id', // Use the original column name in snake_case
            },
            name: {
                type: DataTypes.STRING(100),
                field: 'name', // Use the original column name in snake_case
            },
            sourceUrl: {
                type: DataTypes.STRING(1500),
                field: 'sourceurl', // Use the original column name in snake_case
            },
            baseUrl: {
                type: DataTypes.STRING(1000),
                field: 'baseurl', // Use the original column name in snake_case
            },
            parameters: {
                type: DataTypes.STRING(200),
                field: 'parameters', // Use the original column name in snake_case
            },
            utmSource: {
                type: DataTypes.STRING(250),
                field: 'utm_source', // Use the original column name in snake_case
            },
            utmMedium: {
                type: DataTypes.STRING(250),
                field: 'utm_medium', // Use the original column name in snake_case
            },
            utmCampaign: {
                type: DataTypes.STRING(250),
                field: 'utm_campaign', // Use the original column name in snake_case
            },
            utmContent: {
                type: DataTypes.STRING(250),
                field: 'utm_content', // Use the original column name in snake_case
            },
            campaignDate: {
                type: DataTypes.DATE,
                field: 'campaigndate',
                defaultValue: DataTypes.NOW
            },
            agencyId: {
                type: DataTypes.STRING(100),
                field: 'agencyid', // Use the original column name in snake_case
            },
            conduitoid: {
                type: DataTypes.STRING(100),
                field: 'conduitoid', // Use the original column name in snake_case
            },
            pageType: {
                type: DataTypes.STRING(20),
                field: 'pagetype', // Use the original column name in snake_case
            },
            medium: {
                type: DataTypes.STRING(50),
                field: 'medium', // Use the original column name in snake_case
            },
            agencySlug: {
                type: DataTypes.STRING(1500),
                field: 'agencyslug', // Use the original column name in snake_case
            },
            slugId: {
                type: DataTypes.STRING(100),
                field: 'slug', // Use the original column name in snake_case
            },
            platformPid: {
                type: DataTypes.STRING(100),
                field: 'platformpid', // Use the original column name in snake_case
            },
        }
    }
}

module.exports = Campaign;