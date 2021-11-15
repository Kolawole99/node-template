/**
 *
 * This handles the caching of unique field in a model, based on a particular service.
 * The unique field is determined based on the definition of the model.
 * @module UTILITY:Caching
 */
const { NODE_ENV, REDIS_CONNECTION_PORT, REDIS_PASSWORD, REDIS_CONNECTION_URL } = process.env;
const { promisify } = require('util');
const redis = require('redis');

/**
 *
 * @class
 * @classdesc This is the integration of a caching system using RedisDB(in-memory store) using basic keys such as set, get and del. This can be extended based on use-case, but this class covers the basic operations of caching.
 */
class DatabaseCaching {
    /**
     * This field stores RedisDB client object which would expose the API's to the set, get and del keys
     * @static
     * @field
     */
    static client = redis.createClient({
        host: REDIS_CONNECTION_URL,
        port: REDIS_CONNECTION_PORT,
        password: REDIS_PASSWORD,
    });

    /**
     * Promisify the get key from redis client in order to return value without using callback approach, making use of async/await.
     * @static
     * @field
     *
     */
    static get = promisify(DatabaseCaching.client.get).bind(DatabaseCaching.client);

    /**
     * This method confirms connection to RedisDB.
     * @static
     * @method
     */
    static connectToRedis() {
        try {
            DatabaseCaching.client.on('connect', () => {
                console.log(`🌀 Redis connected on port ${REDIS_CONNECTION_PORT}`);
            });
            DatabaseCaching.client.on('error', (err) => {
                throw err;
            });
        } catch (e) {
            if (NODE_ENV === 'DEVELOPMENT') {
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
        DatabaseCaching.client.set(`${serviceName}-${field}-${value}`, JSON.stringify(result));
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
        } catch (e) {
            if (NODE_ENV === 'DEVELOPMENT') {
                console.error(`[Redis getRecord]: ${e.message}`);
            } else {
                Logger.error(`[Redis getRecord] ${e.message}`);
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
        DatabaseCaching.client.del(`${serviceName}-${field}-${value}`);
    }
}

module.exports = DatabaseCaching;
