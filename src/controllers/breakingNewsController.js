

const BreakingNews = require("../models/breakingNews");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

// १. Create
const createBreakingNews = asyncHandler(async (req, res) => {
    req.body.adminId = req.user.id;
    if (new Date(req.body.endTime) <= new Date(req.body.startTime)) {
        return sendResponse(res, 400, false, "End time हे Start time पेक्षा जास्त हवे.");
    }
    const breaking = await BreakingNews.create(req.body);
    return sendResponse(res, 201, true, "यशस्वीरित्या तयार केली.", breaking);
});

// २. Get All (Role Based)
const getAllBreakingNews = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role !== "Admin") {
        query.adminId = req.user.id;
    }
    const news = await BreakingNews.find(query)
        .populate("adminId", "fullName email")
        .sort({ createdAt: -1 });
    return sendResponse(res, 200, true, "बातम्यांची यादी मिळाली.", news);
});

// ३. Get Live (For App)
const getLiveBreaking = asyncHandler(async (req, res) => {
    const now = new Date();
    const news = await BreakingNews.find({
        startTime: { $lte: now },
        endTime: { $gte: now }
    }).sort({ priority: -1, createdAt: -1 });
    return sendResponse(res, 200, true, "Live बातम्या मिळाल्या.", news);
});

// ४. Get Single By ID
const getBreakingNewsById = asyncHandler(async (req, res) => {
    const news = await BreakingNews.findById(req.params.id).populate("adminId", "fullName");
    if (!news) return sendResponse(res, 404, false, "बातमी सापडली नाही.");
    return sendResponse(res, 200, true, "बातमी मिळाली.", news);
});

// ५. Update
const updateBreakingNews = asyncHandler(async (req, res) => {
    const news = await BreakingNews.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!news) return sendResponse(res, 404, false, "बातमी सापडली नाही.");
    return sendResponse(res, 200, true, "बातमी अपडेट झाली.", news);
});

// ६. Trigger Notification
const triggerNotification = asyncHandler(async (req, res) => {
    const news = await BreakingNews.findById(req.params.id);
    if (!news) return sendResponse(res, 404, false, "News not found");
    news.isPushNotificationSent = true;
    await news.save();
    return sendResponse(res, 200, true, "Push notification status updated!");
});

// ७. Delete
const deleteBreaking = asyncHandler(async (req, res) => {
    await BreakingNews.findByIdAndDelete(req.params.id);
    return sendResponse(res, 200, true, "Breaking news deleted");
});

module.exports = {
    createBreakingNews, getAllBreakingNews, getLiveBreaking,
    getBreakingNewsById, updateBreakingNews, triggerNotification, deleteBreaking
};