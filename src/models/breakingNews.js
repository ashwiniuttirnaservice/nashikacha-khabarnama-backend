const mongoose = require('mongoose');

const breakingNewsSchema = new mongoose.Schema({
    headline: {
        type: String,
        required: [true, "Headline is required"],
        trim: true
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },
    priority: {
        type: Number,
        default: 0,
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    isPushNotificationSent: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Active", "Expired", "Scheduled"],
        default: "Active"
    }
}, {
    timestamps: true
});


// Remove 'next' from the arguments
breakingNewsSchema.pre('save', async function () {
    const now = new Date();
    if (now > this.endTime) {
        this.status = "Expired";
    } else if (now < this.startTime) {
        this.status = "Scheduled";
    } else {
        this.status = "Active";
    }
    // No need to call next() in an async hook
});

const BreakingNews = mongoose.model('BreakingNews', breakingNewsSchema);
module.exports = BreakingNews;