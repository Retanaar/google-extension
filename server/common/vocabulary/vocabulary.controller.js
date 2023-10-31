const logger = require("../../modules/logger");
const vocabularyService = require("./vocabulary.service");
const log = logger('Vocabulary');

class VocabularyController {
    async getDataType(req, res, next) {
        try {
            const dataType = req.params.dataType;
            log.info(`Getting data for [${dataType}]`);
            const allEntries = await vocabularyService.getAllByDataType(dataType);
            res.data = allEntries;
            log.info(`Found [${allEntries.length}] of [${dataType}]`);
            next();
        } catch (ex) {
            next(ex);
        }
    }
    async saveDataType(req, res, next) {
        try {
            const dataType = req.params.dataType;
            log.info(`Saving data for [${dataType}]`);
            const newInstance = await vocabularyService.saveDataType(dataType, req.body);
            res.data = newInstance;
            log.info(`Item [${dataType}] stored`);
            next();
        } catch (ex) {
            next(ex);
        }
    }

}
module.exports = new VocabularyController();