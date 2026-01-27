const mongoose = require('mongoose');

const rashiSchema = new mongoose.Schema({
    rashi: {
        type: String,
        required: [true, "Rashi name is required"],
        unique: true,
        trim: true
    },
    tatva: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    kalavadi: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    bhagyank: {
        type: String,
        trim: true
    },
    subh_ranga: {
        type: String,
        trim: true
    },
    julni: {
        type: String,
        trim: true
    },
    akshar: {
        type: String,
        trim: true
    },
    subh_graha: {
        type: String,
        trim: true
    },
    prem_ani_natesambandh: {
        type: String,
        trim: true
    },
    kariyar_ani_shikshan: {
        type: String,
        trim: true
    },
    arthik_stiti: {
        type: String,
        trim: true
    },
    arogya: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Rashi = mongoose.model('Rashi', rashiSchema);

module.exports = Rashi;