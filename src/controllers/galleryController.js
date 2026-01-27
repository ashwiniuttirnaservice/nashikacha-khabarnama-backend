const Gallery = require("../models/gallery");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const fs = require("fs");
const path = require("path");

const createGallery = asyncHandler(async (req, res) => {
    const photo = req.file ? req.file.filename : null;

    if (!photo) {
        return sendResponse(res, 400, false, "Please upload a photo");
    }

    const galleryData = {
        ...req.body,
        photo,
        tags: req.body.tags ? req.body.tags.split(",").map(t => t.trim()) : []
    };

    const entry = await Gallery.create(galleryData);
    return sendResponse(res, 201, true, "Gallery entry created", entry);
});

// Get All Gallery Items
const getAllGallery = asyncHandler(async (req, res) => {
    const items = await Gallery.find().sort({ createdAt: -1 });
    return sendResponse(res, 200, true, "Gallery fetched", items);
});

// Update Gallery (handles new photo upload)
const updateGallery = asyncHandler(async (req, res) => {
    let item = await Gallery.findById(req.params.id);
    if (!item) return sendResponse(res, 404, false, "Not found");

    const dataToUpdate = { ...req.body };

    if (req.file) {
        // Remove old photo file
        const oldPath = path.join(__dirname, "../../uploads/Gallery", item.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        dataToUpdate.photo = req.file.filename;
    }

    item = await Gallery.findByIdAndUpdate(req.params.id, dataToUpdate, { new: true });
    return sendResponse(res, 200, true, "Gallery updated", item);
});

// Delete Gallery
const deleteGallery = asyncHandler(async (req, res) => {
    const item = await Gallery.findById(req.params.id);
    if (!item) return sendResponse(res, 404, false, "Not found");

    const photoPath = path.join(__dirname, "../../uploads/Gallery", item.photo);
    if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);

    await item.deleteOne();
    return sendResponse(res, 200, true, "Gallery item deleted");
});

module.exports = { createGallery, getAllGallery, updateGallery, deleteGallery };