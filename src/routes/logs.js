const { NODE_ENV } = process.env;
const fs = require("fs")
const router = require('express').Router();
const { Logger, retrieveLogs } = require('../utilities/logger');




try {
    router
        .get('/', async (request, response, next) => {

            const { type, length , timeFilterRange , order, file } = request.query;

        
            try {
                response.send(retrieveLogs({ type, length, timeFilterRange, order, file }));
                return;
          
            } catch (e) {
               next(e)
            }
        
        })
        
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
