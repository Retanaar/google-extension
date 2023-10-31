const express = require('express');
const starboardController = require('../common/starboard/starboard.controller');
const agencyController = require('../common/agency/agency.controller');
const vocabularyController = require('../common/vocabulary/vocabulary.controller')

const router = express.Router();

router
    .route('/campaign/starboard')
    .get(starboardController.getCampaign.bind(starboardController))
    .post(starboardController.saveCampaign.bind(starboardController));


router
    .route('/campaign/agency')
    .get(agencyController.getCampaign.bind(agencyController))
    .post(agencyController.saveCampaign.bind(agencyController));

router
    .route('/vocabulary/:dataType/all')
    .get(vocabularyController.getDataType);

router
    .route('/vocabulary/:dataType')
    .post(vocabularyController.saveDataType);

module.exports = router;