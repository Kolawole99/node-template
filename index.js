const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const expressMongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/** Utilities in the global scope */
require('./src/utilities/customErrors');
require('./src/utilities/encryption');
const { morgan } = require('./src/utilities/logger');
const { loadEventSystem } = require('./src/events/_loader');
const { connect, loadModels } = require('./src/models/_config');

const { NODE_ENV, APP_PORT, APP_NAME } = process.env;

/** App Initialization */
const app = express();

/** Database Connection Setup */
connect();
loadModels();
loadEventSystem();

/** Middleware Applications */
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(expressMongoSanitize());
app.use(hpp());
app.use(morgan);

/** Route Middleware */
app.use('/', require('./src/routes/_config'));

/** Starting Server */
app.listen(APP_PORT, () => {
    if (NODE_ENV === 'DEVELOPMENT') {
        console.log(`🔥 Development Server is running at http://localhost:${APP_PORT} 👍`);
    } else {
        console.log(`😃 ${APP_NAME} is LIVE on port ${APP_PORT}. 👍`);
    }
});
