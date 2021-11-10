const router = require('express').Router();
const { handle404, handleError, setupRequest, processResponse } = require("../middlewares/http");
const { route } = require('./sample');

/** Route Handlers */
const sampleRouteHandler = require('./sample');
const logsRouterHandler = require('./logs');

/** Cross Origin Handling */
router.use(setupRequest);
router.use('/samples', sampleRouteHandler);
router.use(processResponse);

/** Static Routes */
router.use('/image/:imageName', () => { });


/** Query Logs */
router.use('/logs', logsRouterHandler);

router.use(handle404);

router.use(handleError);


module.exports = router;
