const { NODE_ENV, APP_PORT, APP_NAME } = process.env;

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const expressMongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/** Utilities in the global scope */
require('./src/utilities/customErrors');
require('./src/utilities/encryption');
require('./src/utilities/logger');

/** Non-global Utilities */
const { loadEventSystem } = require('./src/events/_loader');
const { connectToDatabase, loadModels } = require('./src/models/_config');

const app = express();
connectToDatabase();
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
app.use(morganRequestMiddleware);

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
