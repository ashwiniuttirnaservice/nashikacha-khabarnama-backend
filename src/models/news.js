const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    reporterName: {
        type: String,
        required: true // इथे आपोआप लॉगिन असलेल्या युजरचे नाव येईल
    },
    breakingNews: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    priority: {
        type: String,
        default: "3"
    },
    shortDescription: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    seoTitle: {
        type: String,
        trim: true
    },
    seoDescription: {
        type: String,
        trim: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Archived'],
        default: 'Draft'
    }
}, {
    timestamps: true
});

const News = mongoose.model('News', newsSchema);
module.exports = News;