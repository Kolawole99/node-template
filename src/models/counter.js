/**
 * This handles all the required configuration for the Counter model and serves as Id generator for each model.
 * @module MODELS:Counter
 */

const { model, Schema } = require('mongoose');

const CounterSchema = new Schema({
    // Model Required fields
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    timeStamp: {
        type: Number,
        required: true,
        default: () => Date.now(),
    },
    createdOn: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
    updatedOn: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
    // Custom Fields
    _id: {
        type: String,
        unique: true,
    },
    sequence: {
        type: Number,
    },
});
model('Counter', CounterSchema);
