const { NODE_ENV } = process.env;

const sinon = require('sinon');
const { expect } = require('chai');

const {
    CustomControllerError,
    CustomValidationError,
} = require('../../../src/utilities/customErrors');
const Controller = require('../../controller/index.test');
const SampleService = require('../../../src/services/sample/sample');
const { createSchema, updateSchema } = require('../../../src/validators/sample');

describe('Tests SampleService', () => {
    let sampleService = null;
    let next = null;

    beforeEach(() => {
        global.SampleController = { ...Controller };
        global.CustomControllerError = CustomControllerError;
        global.CustomValidationError = CustomValidationError;
        global.verifyDevelopmentEnvironment = NODE_ENV === 'development' ? true : false;
        next = sinon.spy((e) => e);
    });

    afterEach(() => {
        global.SampleController = null;
        sampleService = null;
        next = null;
    });

    describe('SampleService.createRecord', () => {
        it('throws an error when body is empty', async () => {
            sampleService = new SampleService();
            await sampleService.createRecord({ request: { body: {} }, next });
            next.called;
        });

        it('Joi validator throws error for invalid data', async () => {
            const body = { id: 1 };

            const validationError = { error: { details: [{ message: 'validation error' }] } };
            sinon.stub(createSchema, 'validate').returns(validationError);

            sampleService = new SampleService();
            await sampleService.createRecord({ request: { body }, next });
            next.called;
            createSchema.validate.restore();
        });

        it('handles Error from Controller', async () => {
            const body = { id: 2, any: 'String' };

            global.SampleController = {
                ...SampleController,
                createRecord: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sinon.stub(createSchema, 'validate').returns({});

            sampleService = new SampleService();
            await sampleService.createRecord({ request: { body }, next });
            next.called;
            createSchema.validate.restore();
        });

        it('create record for valid data', async () => {
            const body = { id: 1, any: 'String' };

            global.SampleController = {
                ...SampleController,
                createRecord: sinon.spy(() => ({ ...body, _id: '1sampleCompany2345' })),
            };

            sinon.stub(createSchema, 'validate').returns({});

            sampleService = new SampleService();
            const success = await sampleService.createRecord({ request: { body }, next });
            expect(success).to.have.ownProperty('payload').to.not.be.null;
            createSchema.validate.restore();
        });
    });

    describe('SampleService.readRecordById', () => {
        it('throws an error when id is not specified', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.readRecordById({ params: {} }, next);
            next.called;
        });

        it('handles Error from Controller', async () => {
            const params = { id: 2 };

            sampleController = {
                ...sampleController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService(sampleController);
            await sampleService.readRecordById({ params }, next);
            next.called;
        });

        it('get a record for valid id', async () => {
            const params = { id: 2 };

            sampleController = {
                ...sampleController,
                readRecords: sinon.spy(() => [{ ...params, is_active: true }]),
            };

            sampleService = new SampleService(sampleController);
            const success = await sampleService.readRecordById({ params }, next);
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.readRecordsByFilter', () => {
        it('throws an error when query object is empty', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.readRecordsByFilter({ query: {} }, next);
            next.called;
        });

        it('handles Error from Controller', async () => {
            const query = { id: 'Two Hundred and Seven' };

            sampleController = {
                ...sampleController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService(sampleController);
            await sampleService.readRecordsByFilter({ query }, next);
            next.called;
        });

        it('get record for valid query', async () => {
            const query = { id: 'Two Hundred and Seven' };

            sampleController = {
                ...sampleController,
                readRecords: sinon.spy(() => [{ ...query, is_active: true }]),
            };

            sampleService = new SampleService(sampleController);
            const success = await sampleService.readRecordsByFilter({ query }, next);
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.readRecordsByWildcard', () => {
        it('throws an error when no query/params', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.readRecordsByWildcard({}, next);
            next.called;
        });

        it('throws an error when params object is empty', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.readRecordsByWildcard({ params: {}, query: {} }, next);
            next.called;
        });

        it('throws an error when query object is empty', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };

            sampleService = new SampleService(sampleController);
            await sampleService.readRecordsByWildcard({ params, query: {} }, next);
            next.called;
        });

        it('handles Error from Controller', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };
            const query = { id: 'Two Hundred and Seven' };

            sampleController = {
                ...sampleController,
                readRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService(sampleController);
            await sampleService.readRecordsByWildcard({ query, params }, next);
            next.called;
        });

        it('get record for valid query', async () => {
            const params = { keys: 'String, Same, Strata', keyword: 'Value' };
            const query = { id: 'Two Hundred and Seven' };

            sampleController = {
                ...sampleController,
                readRecords: sinon.spy(() => [{ ...query, is_active: true }]),
            };

            sampleService = new SampleService(sampleController);
            const success = await sampleService.readRecordsByWildcard({ query, params }, next);
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.updateRecordById', () => {
        it('throws an error when param ID is not specified', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.updateRecordById({ params: {} }, next);
            next.called;
        });

        it('throws an error when body is empty', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.updateRecordById({ params: { id: 87 }, body: {} }, next);
            next.called;
        });

        it('Joi validator throws error for invalid body schema', async () => {
            const body = { id: 1 };
            const params = { id: 87 };

            const validationError = { error: { details: [{ message: 'validation error' }] } };
            sinon.stub(updateSchema, 'validate').returns(validationError);

            sampleService = new SampleService(sampleController);
            await sampleService.updateRecordById({ params, body }, next);
            next.called;
            updateSchema.validate.restore();
        });

        it('handles Error from Controller', async () => {
            const body = { any: 'String' };
            const params = { id: 3 };

            sampleController = {
                ...sampleController,
                updateRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sinon.stub(updateSchema, 'validate').returns({});

            sampleService = new SampleService(sampleController);
            await sampleService.updateRecordById({ params, body }, next);
            next.called;
            updateSchema.validate.restore();
        });

        it('updates a record', async () => {
            const body = { any: 'String' };
            const params = { id: 3 };

            sampleController = {
                ...sampleController,
                updateRecords: sinon.spy(() => ({
                    ...body,
                    id: 1,
                    _id: '1samplecompany2345',
                    is_active: true,
                    ok: 1,
                    nModified: 1,
                })),
            };

            sinon.stub(updateSchema, 'validate').returns({});

            sampleService = new SampleService(sampleController);
            const success = await sampleService.updateRecordById({ params, body }, next);
            expect(success).to.have.ownProperty('payload').to.not.be.null;
            updateSchema.validate.restore();
        });
    });

    describe('SampleService.updateRecords', () => {
        it('throws an error when options/data does not exist', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.updateRecords({ body: {} }, next);
            next.called;
        });

        it('throws an error when options is empty', async () => {
            const body = { options: {}, data: {} };
            sampleService = new SampleService(sampleController);
            await sampleService.updateRecords({ body }, next);
            next.called;
        });

        it('throws an error when data is empty', async () => {
            const body = { options: { any: 'String' }, data: {} };
            sampleService = new SampleService(sampleController);
            await sampleService.updateRecords({ body }, next);
            next.called;
        });

        it('handles Error from Controller', async () => {
            const body = { options: { any: 'String' }, data: { any: 'String' } };

            sampleController = {
                ...sampleController,
                updateRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService(sampleController);
            await sampleService.updateRecords({ body }, next);
            next.called;
        });

        it('updates records', async () => {
            const body = { options: { any: 'String' }, data: { any: 'String' } };

            sampleController = {
                ...sampleController,
                updateRecords: sinon.spy(() => ({
                    ...body,
                    id: 1,
                    _id: '1samplecompany2345',
                    is_active: true,
                    ok: 1,
                    nModified: 1,
                })),
            };

            sampleService = new SampleService(sampleController);
            const success = await sampleService.updateRecords({ body }, next);
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.deleteRecordById', () => {
        it('throws error when id is not specified', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.deleteRecordById({ params: {} }, next);
            next.called;
        });

        it('handles Error from Controller', async () => {
            sampleController = {
                ...sampleController,
                deleteRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService(sampleController);
            await sampleService.deleteRecordById({ params: { id: 2 } }, next);
            next.called;
        });

        it('delete a record for valid a id', async () => {
            const params = { id: 2 };

            sampleController = {
                ...sampleController,
                deleteRecords: sinon.spy(() => ({ nModified: 1, ok: 1 })),
            };

            sampleService = new SampleService(sampleController);
            const success = await sampleService.deleteRecordById({ params }, next);
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });

    describe('SampleService.deleteRecords', () => {
        it('throws an error when body options is empty', async () => {
            sampleService = new SampleService(sampleController);
            await sampleService.deleteRecords({ body: { options: {} } }, next);
            next.called;
        });

        it('handles Error from Controller', async () => {
            sampleController = {
                ...sampleController,
                deleteRecords: sinon.spy(() => ({ failed: true, error: 'Just a random error' })),
            };

            sampleService = new SampleService(sampleController);
            await sampleService.deleteRecords({ body: { options: { any: 'String' } } }, next);
            next.called;
        });

        it('deletes records', async () => {
            sampleController = {
                ...sampleController,
                deleteRecords: sinon.spy(() => ({ ok: 1, nModified: 4, n: 4 })),
            };
            sampleService = new SampleService(sampleController);
            const success = await sampleService.deleteRecords(
                { body: { options: { any: 'String' } } },
                next
            );
            expect(success).to.have.ownProperty('payload').to.not.be.null;
        });
    });
});
