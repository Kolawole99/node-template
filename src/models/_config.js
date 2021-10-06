/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 * */

const { APP_DB_URI, NODE_ENV } = process.env;

const glob = require('glob');
const { resolve } = require('path');
const mongoose = require('mongoose');
const { Logger } = require('../utilities/logger');

module.exports.connect = () => {
    try {
        mongoose.connect(
            APP_DB_URI,
            {
                autoIndex: false,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
            (err, data) => {
                if (err) {
                    if (NODE_ENV !== 'DEVELOPMENT') {
                        Logger.error(`[Database Connection Error] ${err}`);
                    }
                    console.log('🔴 Database connection failed.');
                    return;
                }
                if (data) console.log('🟢 Database connection successful.');
            }
        );
    } catch (e) {
        if (NODE_ENV === 'DEVELOPMENT') {
            console.log(`DB Error: ${e.message}`);
        } else {
            Logger.error(`[DB Error: ] ${e.message}`);
        }
    }
};

module.exports.loadModels = () => {
    const basePath = resolve(__dirname, '../models/');
    const files = glob.sync('*.js', { cwd: basePath });
    files.forEach((file) => {
        if (file.toLocaleLowerCase().includes('_config')) return;
        // eslint-disable-next-line
        require(resolve(basePath, file));
    });
};
