const express = require('express');
const router = express.Router();
const logger = require('./logger'); // Import your custom logger
const dbRepo = require('./db');

const log = logger('Vocabulary');

const TYPE_AGENCY = 'agency';
const TYPE_CLIENT_AGENCY = 'clientagency';
const TYPE_CLIENT_STARBOARD = 'clientstarboard';
const TYPE_PAGE_TYPE = 'pagetype';
const TYPE_SOURCE = 'source';
const TYPE_MEDIUM = 'medium';
const TYPE_CAMPAIGN = 'campaign';
const TYPE_ISSUE_TOPIC = 'topic';
const TYPE_DATA_FEE = 'fee';
const TYPE_ON_PAGE = 'onpage';

router.get('/:dataType/all', async (req, res,next) => {
    try {
        const dataType = req.params.dataType;
        log.info(`Getting data for [${dataType}]`);
        const model = _getModelByType(dataType, dbRepo.repository());
        const allEntries = await model.findAll({
            attributes: {exclude: ['id', 'oid']},
        });
        log.info(`Found [${allEntries.length}] of [${dataType}]`);
        res.data = allEntries;
        next();
    } catch (ex) {
        next(ex);
    }
});

router.post('/:dataType', async (req, res, next) => {
    try {
        const dataType = req.params.dataType;
        log.info(`Saving data for [${dataType}]`);
        const model = _getModelByType(dataType, dbRepo.repository());
        const newInstance = model.build(req.body);
        await newInstance.save();
        res.data = newInstance;
        log.info(`Item [${dataType}] stored`);
        next();
    } catch (ex) {
        next(ex);
    }
});

function _getModelByType(type, repository) {
    switch (type) {
        case TYPE_AGENCY:
            return repository.Agency;
        case TYPE_CLIENT_AGENCY:
            return repository.ClientAgency;
        case TYPE_CLIENT_STARBOARD:
            return repository.ClientStarboard;
        case TYPE_PAGE_TYPE:
            return repository.PageType;
        case TYPE_SOURCE:
            return repository.Source;
        case TYPE_MEDIUM:
            return repository.Medium;
        case TYPE_CAMPAIGN:
            return repository.SlugCampaign;
        case TYPE_ISSUE_TOPIC:
            return repository.Topic;
        case TYPE_DATA_FEE:
            return repository.FeeType;
        case TYPE_ON_PAGE:
            return {
                findAll: async () => [{id: 'SPLIT'}, {id: 'NONE'}, {id:'ZERO'}],
                save: async () => {throw 'Unsupported operation'}
            };
        default:
            throw {message: `Unknown type [${type}]`};
    }
}

module.exports = router;
