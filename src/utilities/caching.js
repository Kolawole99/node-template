/**
 *
 * This handles the caching of unique field in a model, based on a particular service.
 * The unique field is determined based on the definition of the model.
 * @module UTILITY:Caching
 */
const { REDIS_CONNECTION_PORT, REDIS_PASSWORD, REDIS_CONNECTION_URL } = process.env;
const { promisify } = require('util');
const redis = require('redis');

/**
 *
 * @class
 * @classdesc This is the integration of a caching system using RedisDB(in-memory store) using basic keys such as set, get and del. This can be extended based on use-case, but this class covers the basic operations of caching.
 */
class DatabaseCaching {
    constructor() {
        this.connectToRedis();
        this.client = null;
        this.get = null;
    }

    /**
     * This method confirms connection to RedisDB.
     * @static
     * @method
     */
    connectToRedis() {
        try {
            const client = redis.createClient({
                host: REDIS_CONNECTION_URL,
                port: REDIS_CONNECTION_PORT,
                password: REDIS_PASSWORD,
            });

            client.on('connect', () => {
                console.log(`👍 Redis connected on port ${REDIS_CONNECTION_PORT}`);
                this.client = client;
                this.get = promisify(this.client.get).bind(this.client);
            });
            client.on('error', (err) => {
                throw err;
            });
        } catch (e) {
            if (verifyDevelopmentEnvironment) {
                console.log(`Redis connectToRedis: ${e.message}`);
            } else {
                Logger.error(`[Redis connectToRedis : ] ${e.message}`);
            }
        }
    }

    /**
     * This method insert a key-value object into RedisDB.
     * The field's value is expected to be unique, to create a quick access of O(1).
     * @static
     * @method
     * @param {string} field The field's value is expected to be unique, to create a quick access of O(1).
     * @param {any} value The field's value which can be any valid JavaScript type.
     * @param {any} result The payload or object to be stored which is stringified before being saved into RedisDB.
     * @param {string} serviceName The name of the service that requires the payload and also adds to the uniqueness of the keys.
     *
     */
    static insertRecord(field, value, result, serviceName) {
        try {
            this.client.set(`${serviceName}-${field}-${value}`, JSON.stringify(result));
        } catch (error) {
            if (verifyDevelopmentEnvironment) {
                console.log(`Redis insertRecord: ${error.message}`);
            } else {
                Logger.error(`[Redis insertRecord : ] ${error.message}`);
            }
        }
    }

    /**
     * This method returns the object or payload stored into RedisDB.
     *
     * @static
     * @method
     * @param {string} field The field's value is expected to be unique, to create a quick access of O(1)
     * @param {any} value The field's value which can be any valid JavaScript type.
     * @param {string} serviceName The name of the service that requires the payload.
     * @returns {object} The payload stored which is parsed into a JSON object.
     */
    static async getRecord(field, value, serviceName) {
        try {
            const result = await DatabaseCaching.get(`${serviceName}-${field}-${value}`);
            return JSON.parse(result);
        } catch (error) {
            if (verifyDevelopmentEnvironment) {
                console.log(`Redis getRecord: ${error.message}`);
            } else {
                Logger.error(`[Redis getRecord : ] ${error.message}`);
            }
        }
    }

    /**
     * This method delete the object or payload stored into RedisDB.
     *
     * @static
     * @method
     * @param {string} field The field's value is expected to be unique, to create a quick access of O(1)
     * @param {any} value The field's value which can be any valid JavaScript type.
     * @param {string} serviceName The name of the service that requires the payload.
     */
    static deleteRecord(field, value, serviceName) {
        try {
            this.client.del(`${serviceName}-${field}-${value}`);
        } catch (error) {
            if (verifyDevelopmentEnvironment) {
                console.log(`Redis deleteRecord: ${error.message}`);
            } else {
                Logger.error(`[Redis deleteRecord: ] ${error.message}`);
            }
        }
    }
}

const cacheStore = new DatabaseCaching();
module.exports = cacheStore;
