const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./modules/logger');
const db = require('./modules/db');

const vocabulary = require('./modules/vocabulary');
const campaign = require('./modules/campaign');
const router = require('./routes/router');

const app = express();
const log = logger('Main');

const PORT = parseInt(process.env.PORT) || 8080;

app.use(bodyParser.json());
app.use('/readiness_check', (req, resp, next) => {
    resp.status(200).send('Ready');
});
app.use('/liveness_check', (req, resp, next) => {
    resp.status(200).send('Ready');
});

//app.use('/vocabulary', vocabulary);
//app.use('/campaign', campaign);
app.use(router);
app.use((req, res, next) => {
    log.info('Building response');
    res.status(200).json({
        success: true,
        data: res.data,
    });
});
app.use((err,req, res, next) => {
    log.info('Building error response');
    res.status(500).json({
        success: false,
        error: err,
    });
});

db.init().then(() => {
    app.listen(PORT, () => {
        log.info(`App listening on port ${PORT}`);
        log.info('Press Ctrl+C to quit.');
    });
}).catch(ex => {
    log.error(ex);
})

