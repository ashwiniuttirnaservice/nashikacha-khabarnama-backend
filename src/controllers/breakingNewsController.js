const BreakingNews = require("../models/breakingNews");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

const createBreakingNews = asyncHandler(async (req, res) => {
    const breaking = await BreakingNews.create(req.body);
    return sendResponse(res, 201, true, "Breaking News created", breaking);
});


const getLiveBreaking = asyncHandler(async (req, res) => {
    const news = await BreakingNews.find().sort({ createdAt: -1 });
    return sendResponse(res, 200, true, "All news fetched for debugging", news);
});


const triggerNotification = asyncHandler(async (req, res) => {
    const news = await BreakingNews.findById(req.params.id);
    if (!news) return sendResponse(res, 404, false, "News not found");


    news.isPushNotificationSent = true;
    await news.save();

    return sendResponse(res, 200, true, "Push notification triggered successfully");
});


const deleteBreaking = asyncHandler(async (req, res) => {
    await BreakingNews.findByIdAndDelete(req.params.id);
    return sendResponse(res, 200, true, "Breaking news deleted");
});

module.exports = { createBreakingNews, getLiveBreaking, triggerNotification, deleteBreaking };