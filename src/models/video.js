const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Video title is required"],
        trim: true
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    videoUrl: {
        type: String,
        required: [true, "Video URL is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
}, {
    timestamps: true
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;