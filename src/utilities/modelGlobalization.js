/**
 * This module handles the globalization of all the mongoose models.
 * This ensures they are properly instantiated into the Global namespace.
 * @module UTILITY:ModelsControllerGlobalization
 */

const mongoose = require('mongoose');
const Controller = require('../controllers/index');

const models = mongoose.modelNames();
for (let i = 0; i < models.length; i++) {
    global[models[i] + 'Controller'] = new Controller(models[i]);
}
