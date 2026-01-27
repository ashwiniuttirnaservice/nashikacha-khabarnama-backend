const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    photo: {
        type: String,
        required: [true, "Photo is required"]
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    photographerName: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;