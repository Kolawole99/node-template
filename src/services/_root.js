/**
 * This is the Super Class that contains the general Service methods
 * @module SERVICE:Root
 */

const appEvent = require('../events/_config');
const { buildQuery } = require('../utilities/query');

/**
 * This contains service class generic methods
 * @class
 */
class RootService {
    /**
     *
     * Removes all JOI Validator decoration from Error messages
     * @method
     * @param {string} message The error.message string thrown from JOI Validation when a property does not match the specification.
     * @returns {string} Formatted version of JOI message string.
     */
    filterJOIValidation(message) {
        const regex = /["]+/g;
        return message.replace(regex, '');
    }

    /**
     * @typedef FormatErrorParameter
     * @property {string} serviceName The string defining the current service instance
     * @property {Error} error The error instance thrown
     * @property {string} functionName The name of the function that calls this method
     */
    /**
     *
     * These function handles setting the error codes and cleaning up error messages based on the process environment
     * @method
     * @param {FormatErrorParameter} destructuredObject
     * @returns {object} This contains errorMessage and statusCode
     */
    formatError({ serviceName, error, functionName }) {
        let statusCode;
        if (error instanceof CustomValidationError) {
            statusCode = 412;
        } else if (error instanceof CustomControllerError) {
            statusCode = 500;
        }
      
            const errorMessage = process.env.NODE_ENV === 'DEVELOPMENT'
                    ? `[${serviceName}] ${functionName}: ${error.message}`
                    : error.message;
     
       
        return { errorMessage, statusCode };
    }

    /**
     *
     * @typedef ProcessFailedResponseParameter
     * @property {string} message The error message
     * @property {number} code The status code
     */

    /**
     *
     * This methods is used to format all Failed responses and is called internally only
     * @method
     * @static
     * @param {ProcessFailedResponseParameter} destructuredObject The instance of the defined param object.
     * @returns {object} This always has error set to a string and payload to null.
     */
    static #processFailedResponse({ message, code = 400 }) {
        return {
            error: message,
            payload: null,
            status: code,
        };
    }

    /**
     *
     * @typedef ProcessSuccessfulResponseParameter
     * @property {object} payload The payload
     * @property {number} code The status code
     * @property {boolean} sendRawResponse defines response medium
     * @property {string} responseType A string defining the response type to return
     */

    /**
     *
     * This methods is used to format all successful responses and is called internally only
     * @method
     * @static
     * @param {ProcessSuccessfulResponseParameter} destructuredObject The instance of the defined param object
     * @returns {object} This always has error set to null and payload an object.
     */
    static #processSuccessfulResponse({
        payload,
        code = 200,
        sendRawResponse = false,
        responseType = 'application/json',
    }) {
        return {
            payload,
            error: null,
            responseType,
            sendRawResponse,
            status: code,
        };
    }

    /**
     *
     * @typedef HandleDatabaseReadParameter
     * @property {Class} Controller The response from the Controller request to the database
     * @property {object} queryOptions The response from the Controller request to the database
     * @property {object} extraOptions A string defining the event to be fired
     */

    /**
     *
     * This methods is used to query the database to read items from the database by a generated query
     * @method
     * @async
     * @param {HandleDatabaseReadParameter} destructuredObject The instance of the defined param object
     * @returns An the response from the Controller
     */
    async handleDatabaseRead({ Controller, queryOptions, extraOptions = {} }) {
        const { count, fieldsToReturn, limit, seekConditions, skip, sortCondition } =
            buildQuery(queryOptions);

        const result = await Controller.readRecords(
            { ...seekConditions, ...extraOptions },
            fieldsToReturn,
            sortCondition,
            count || false,
            skip,
            limit
        );
        return result;
    }

    /**
     *
     * This methods is used to handle the response from every single document read request
     * @method
     * @param {object} result The response from the Controller request to the database
     * @returns An instance of SuccessfulResponse/FailedResponse
     */
    processSingleRead(result) {
        if (result && result.id) return RootService.#processSuccessfulResponse(result);
        return RootService.#processFailedResponse('Resource not found', 404);
    }

    /**
     *
     * This methods is used to handle the response from every multiple read request
     * @method
     * @param {object} result The response from the Controller request to the database
     * @returns An instance of SuccessfulResponse/FailedResponse
     */
    processMultipleReadResults(result) {
        if (result && (result.count || result.length >= 0)) {
            return RootService.#processSuccessfulResponse(result);
        }
        return RootService.#processFailedResponse('Resources not found', 404);
    }

    /**
     *
     * @typedef ProcessUpdateResult
     * @property {object} result The response from the Controller request to the database
     * @property {string} eventName A string defining the event to be fired
     */

    /**
     *
     * This methods is used to handle the response from every update request
     * @method
     * @param {ProcessUpdateResult} destructuredObject
     * @returns An instance of SuccessfulResponse/FailedResponse
     */
    processUpdateResult({ result, eventName }) {
        if (result && result.ok && result.nModified) {
            if (eventName) {
                appEvent.emit(eventName, result);
            }
            return RootService.#processSuccessfulResponse(result);
        }
        if (result && result.ok && !result.nModified) {
            return RootService.#processSuccessfulResponse(result, 204);
        }
        return RootService.#processFailedResponse('Update failed', 400);
    }

    /**
     *
     * This methods is used to handle the response from every delete request
     * @method
     * @param {object} result The response from the controller
     * @returns An instance of SuccessfulResponse/FailedResponse
     */
    processDeleteResult(result) {
        if (result && result.nModified) return RootService.#processSuccessfulResponse(result);
        return RootService.#processFailedResponse('Deletion failed.', 200);
    }
}

module.exports = RootService;
