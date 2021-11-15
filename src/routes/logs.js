/**
 * This handles all the required routes configuration for the application logs and external logging feature.
 * @module ROUTES:Logs
 */

const { NODE_ENV } = process.env;

const router = require('express').Router();

const { Logger, retrieveLogs } = require('../utilities/logger');

try {
    router.get('/', async (request, response, next) => {
        response.send(await retrieveLogs(request.query));
    });
} catch (e) {
    const currentRoute = '[Route Error] /logs';
    if (NODE_ENV !== 'DEVELOPMENT') {
        Logger.error(`${currentRoute}: ${e.message}`);
    } else {
        console.log(`${currentRoute}: ${e.message}`);
    }
} finally {
    module.exports = router;
}
