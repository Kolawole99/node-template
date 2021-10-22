/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 * */

const appEvent = require('../events/_config');
const { buildQuery } = require('../utilities/query');

class RootService {
    formatError(serviceName, error, functionName) {
        let statusCode;
        if (error instanceof CustomValidationError) {
            statusCode = 412;
        } else if (error instanceof CustomControllerError) {
            statusCode = 500;
        }

        const errorMessage =
            NODE_ENV === 'DEVELOPMENT'
                ? `[${serviceName}] ${functionName}: ${error.message}`
                : error.message;

        return { errorMessage, statusCode };
    }

    processFailedResponse(message, code = 400) {
        return {
            error: message,
            payload: null,
            status: code,
        };
    }

    processSuccessfulResponse(
        payload,
        code = 200,
        sendRawResponse = false,
        responseType = 'application/json'
    ) {
        return {
            payload,
            error: null,
            responseType,
            sendRawResponse,
            status: code,
        };
    }

    async handleDatabaseRead(Controller, queryOptions, extraOptions = {}) {
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

    processSingleRead(result) {
        if (result && result.id) return this.processSuccessfulResponse(result);
        return this.processFailedResponse('Resource not found', 404);
    }

    processMultipleReadResults(result) {
        if (result && (result.count || result.length >= 0)) {
            return this.processSuccessfulResponse(result);
        }
        return this.processFailedResponse('Resources not found', 404);
    }

    processUpdateResult(result, eventName) {
        if (result && result.ok && result.nModified) {
            if (eventName) {
                appEvent.emit(eventName, result);
            }
            return this.processSuccessfulResponse(result);
        }
        if (result && result.ok && !result.nModified) {
            return this.processSuccessfulResponse(result, 204);
        }
        return this.processFailedResponse('Update failed', 400);
    }

    processDeleteResult(result) {
        if (result && result.nModified) return this.processSuccessfulResponse(result);
        return this.processFailedResponse('Deletion failed.', 200);
    }
}

module.exports = RootService;
