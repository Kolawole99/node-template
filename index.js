const { NODE_ENV, APP_PORT, APP_NAME } = process.env;

const expressMongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');

/** Global Utilities */
require('./src/utilities/mailing/sendEmail');
require('./src/utilities/customErrors');
require('./src/utilities/encryption');
require('./src/utilities/logger');

/** Non-global Utilities */
const { connectToDatabase, loadModels } = require('./src/models/_config');
const { loadEventSystem } = require('./src/events/_loader');

const app = express();
connectToDatabase();
loadEventSystem();
loadModels();

/** Middleware Applications */
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morganRequestMiddleware);
app.use(expressMongoSanitize());
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(hpp());

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
