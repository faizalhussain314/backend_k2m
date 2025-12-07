const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const settingSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            required: true
        },
       
       
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
settingSchema.plugin(toJSON);
settingSchema.plugin(paginate);


/**
 * @typedef Settings
 */
const Settings = mongoose.model('Settings', settingSchema);

module.exports = Settings;
