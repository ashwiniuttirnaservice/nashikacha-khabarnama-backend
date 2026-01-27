
const Video = require("../models/video");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");


const createVideo = asyncHandler(async (req, res) => {
    const video = await Video.create(req.body);
    return sendResponse(res, 201, true, "Video added successfully", video);
});


const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find().sort({ priority: -1, createdAt: -1 });
    return sendResponse(res, 200, true, "Videos fetched successfully", videos);
});


const getVideoById = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);
    if (!video) return sendResponse(res, 404, false, "Video not found");
    return sendResponse(res, 200, true, "Video fetched successfully", video);
});


const updateVideo = asyncHandler(async (req, res) => {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!video) return sendResponse(res, 404, false, "Video not found");
    return sendResponse(res, 200, true, "Video updated successfully", video);
});


const deleteVideo = asyncHandler(async (req, res) => {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return sendResponse(res, 404, false, "Video not found");
    return sendResponse(res, 200, true, "Video deleted successfully");
});

module.exports = { createVideo, getAllVideos, getVideoById, updateVideo, deleteVideo };