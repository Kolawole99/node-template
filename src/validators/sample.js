const Joi = require('@hapi/joi');

const createSchema = Joi.object({
    id: Joi.string().min(1).max(Number.MAX_SAFE_INTEGER),
    param: Joi.string().label('Params'),
});

const updateSchema = Joi.object({ any: Joi.string() });

module.exports = {
    createSchema,
    updateSchema,
};
