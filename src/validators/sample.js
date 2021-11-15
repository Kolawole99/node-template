/**
 * Handles the implementation of Joi package for Sample service validation
 * @module VALIDATOR:Sample
 */

const Joi = require('@hapi/joi');

const createSchema = Joi.object({
    firstName: Joi.string().required().label('First Name'),
    lastName: Joi.string().required().label('Last Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).max(16).required().label('Password'),
    confirmPassword: Joi.any()
        .equal(Joi.ref('password'))
        .required()
        .label('Confirm password')
        .options({ messages: { 'any.only': '{{#label}} does not match' } }),
});

const updateSchema = Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).max(16).required().label('Password'),
});

module.exports = {
    createSchema,
    updateSchema,
};
