/**
 * This is a base implementation that extends Node.js Transform streams
 * @module STREAMS:SampleTransformStream
 */
const { Transform } = require('stream');

/**
 * This extends the Transform streams implementing a sample code that does a local transform.
 * TODO: You can strip out all the code in this file to implement what you need. These are all placeholders
 * @class
 */
class SampleTransformStream extends Transform {
    constructor(ContactController, tenantId, options = {}) {
        super(options);
        this.contactController = ContactController;
        this.tenantId = tenantId;
    }

    async _transform(chunk, encoding, callback) {
        const asString = Buffer.from(chunk).toString();
        const asObject = JSON.parse(asString);
        const record = await this.contactController.createRecord({
            ...asObject,
            tenantId: this.tenantId,
        });
        this.push(JSON.stringify(record));
        callback();
    }
}

module.exports = SampleTransformStream;
