const { Sequelize } = require('sequelize');
const secretManager = require('./secrets');
const logger = require('./logger');
const AgencyClass = require('../models/agency');
const SlugCampaignClass = require('../models/slugCampaign');
const ClientAgencyClass = require('../models/clientAgency');
const ClientStarboardClass = require('../models/clientStarboard');
const FeeClass = require('../models/fee');
const FeeTypeClass = require('../models/feeType');
const MediumClass = require('../models/medium');
const PageTypeClass = require('../models/pagetype');
const SourceClass = require('../models/source');
const TopicClass = require('../models/topic');
const SlugClass = require('../models/slug');
const CampaignClass = require('../models/campaign');

const log = logger('DB');

async function getConnectionSettings() {
    log.info('Getting DB connection settings');
    const database = await secretManager.getSecret('db-name');
    const username = await secretManager.getSecret('db-user');
    const password = await secretManager.getSecret('db-user-pass');
    const host = await secretManager.getSecret('db-host');
    const port = await secretManager.getSecret('db-port');
    const dialect = 'mysql';
    log.info('DB connection settings fetched');
    return {database, username, password, host, port, dialect};
}

async function init() {
    log.info('Initializing Sequelize ORM');
    const connectionSettings = await getConnectionSettings();
    sequelize = new Sequelize(connectionSettings);
    await sequelize.authenticate();
    log.info('DB Connection initialized');

    const Agency = initModel(AgencyClass, 'Agency');
    const Slug = initModel(SlugClass, 'Slug');
    const SlugCampaign = initModel(SlugCampaignClass, 'SlugCampaign');
    const ClientAgency = initModel(ClientAgencyClass, 'ClientAgency');
    const ClientStarboard = initModel(ClientStarboardClass, 'ClientStarboard');
    const Medium = initModel(MediumClass, 'Medium');
    const PageType = initModel(PageTypeClass, 'PageType');
    const Source = initModel(SourceClass, 'Source');
    const Topic = initModel(TopicClass, 'Topic');
    const FeeType = initModel(FeeTypeClass, 'FeeType');
    const Fee = initModel(FeeClass, 'Fee');
    const Campaign = initModel(CampaignClass, 'Campaign');


    Campaign.hasOne(Slug, {
        as: 'slugData',
        foreignKey: 'id',
        sourceKey: 'slugId'
    });

    Campaign.hasOne(ClientStarboard, {
        as: 'clientStarboard',
        foreignKey: 'oid',
        sourceKey: 'conduitoid'
    });

    Campaign.hasOne(ClientAgency, {
        as: 'clientAgency',
        foreignKey: 'oid',
        sourceKey: 'conduitoid'
    });

    Campaign.hasMany(Fee, {
        as: 'fees',
        foreignKey: 'campaignId',
        sourceKey: 'id'
    });

    Fee.hasOne(FeeType, {
        as: 'feeType',
        foreignKey: 'id',
        sourceKey: 'feeTypeId'
    });

    return {Agency, Slug, Campaign, SlugCampaign, ClientAgency, ClientStarboard, Fee, Medium, PageType, Source, Topic, FeeType};
}

function initModel(modelClass, modelName) {
    return sequelize.define(modelName,
        modelClass.fields(),
        {tableName: modelClass.tableName(), timestamps: false});
}

let sequelize;
let initializedModels = {};

module.exports = {
 close: async function() {
     await sequelize.close();
     log.info('DB connection closed');
 },
 newTransaction: async () => sequelize.transaction(),
 init: async function () {
     initializedModels = await init();
 },
 repository: () => initializedModels
};
