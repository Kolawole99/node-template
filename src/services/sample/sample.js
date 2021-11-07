const RootService = require('../_root');
const { buildQuery, buildWildcardOptions } = require('../../utilities/query');
const { createSchema, updateSchema } = require('../../validators/sample');

class SampleService extends RootService {
    constructor(sampleController) {
        super();
        this.sampleController = sampleController;
        this.serviceName = 'SampleService';
    }

    async createRecord(request, next) {
        try {
            const { body } = request;
            const { error } = createSchema.validate(body);
            if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));

            const result = await this.sampleController.createRecord({ ...body });
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processSingleRead(result);
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'createRecord');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }

    async readRecordById(request, next) {
        try {
            const { id } = request.params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');

            const result = await this.sampleController.readRecords({ id, isActive: true });
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processSingleRead(result[0]);
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'readRecordById');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }

    async readRecordsByFilter(request, next) {
        try {
            const { query } = request;
            if (Object.keys(query).length === 0)
                throw new CustomValidationError('Query is required to filter.');

            const result = await this.handleDatabaseRead(this.sampleController, query);
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processMultipleReadResults(result);
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'readRecordsByFilter');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }

    async readRecordsByWildcard(request, next) {
        try {
            const { params, query } = request;
            if (!params || !query) throw new CustomValidationError('Invalid key/keyword');
            if (Object.keys(params).length === 0) {
                throw new CustomValidationError('Keys are required to read');
            }
            if (Object.keys(query).length === 0) {
                throw new CustomValidationError('Keywords are required to read');
            }

            const wildcardConditions = buildWildcardOptions(params.keys, params.keyword);
            const result = await this.handleDatabaseRead(
                this.sampleController,
                query,
                wildcardConditions
            );
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processMultipleReadResults(result);
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'readRecordsByWildcard');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }

    async updateRecordById(request, next) {
        try {
            const { id } = request.params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');

            const data = request.body;
            if (Object.keys(data).length === 0)
                throw new CustomValidationError('Update requires data.');

            const { error } = updateSchema.validate(data);
            if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));

            const result = await this.sampleController.updateRecords({ id }, { ...data });
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processUpdateResult(result);
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'updateRecordById');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }

    async updateRecords(request, next) {
        try {
            const { options, data } = request.body;
            if (!options || !data) throw new CustomValidationError('Invalid options/data');
            if (Object.keys(options).length === 0) {
                throw new CustomValidationError('Options are required to update');
            }
            if (Object.keys(data).length === 0)
                throw new CustomValidationError('Data is required to update');

            const { seekConditions } = buildQuery(options);

            const result = await this.sampleController.updateRecords(
                { ...seekConditions },
                { ...data }
            );
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processUpdateResult({ ...data, ...result });
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'updateRecords');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }

    async deleteRecordById(request, next) {
        try {
            const { id } = request.params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');

            const result = await this.sampleController.deleteRecords({ id });
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processDeleteResult(result);
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'deleteRecordById');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }

    async deleteRecords(request, next) {
        try {
            const { options } = request.body;
            if (Object.keys(options).length === 0)
                throw new CustomValidationError('Options are required');

            const { seekConditions } = buildQuery(options);

            const result = await this.sampleController.deleteRecords({ ...seekConditions });
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processDeleteResult({ ...result });
        } catch (e) {
            let processedError = this.formatError(this.serviceName, e, 'deleteRecords');
            const err = this.processFailedResponse(
                processedError.errorMessage,
                processedError.statusCode
            );
            return next(err);
        }
    }
}

module.exports = SampleService;
