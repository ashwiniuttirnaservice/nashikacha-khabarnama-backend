const Gallery = require("../models/gallery");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const uploadToAws = require("../help/awsUpload.js");

/**
 * @desc    Create Gallery Entry (Admin Register प्रमाणेच)
 */
const createGallery = asyncHandler(async (req, res) => {
  // Admin प्रमाणे req.files मधून फोटो घेणे
  let fileDetails = null;
  try {
    if (req.files?.galleryPhoto?.[0]) {
      fileDetails = await uploadToAws({
        file: req.files.galleryPhoto[0],
        fileName: `gallery_${Date.now()}`,
        folderName: "Gallery",
      });
    }
  } catch (awsError) {
    console.log("AWS Error: गॅलरी फोटो अपलोड झाला नाही.");
    fileDetails = null;
  }

  if (!fileDetails) {
    return sendResponse(res, 400, false, "कृपया फोटो अपलोड करा.");
  }

  const entry = await Gallery.create({
    ...req.body,
    photo: fileDetails, // पूर्ण ऑब्जेक्ट (cdnUrl, size सह) सेव्ह होईल
    tags: req.body.tags ? req.body.tags.split(",").map((t) => t.trim()) : [],
  });

  return sendResponse(
    res,
    201,
    true,
    "गॅलरीमध्ये फोटो यशस्वीरित्या जोडला.",
    entry,
  );
});

/**
 * @desc    Update Gallery Item
 */
const updateGallery = asyncHandler(async (req, res) => {
  let item = await Gallery.findById(req.params.id);
  if (!item) return sendResponse(res, 404, false, "आयटम सापडला नाही.");

  let fileDetails = item.photo; // आधीचा फोटो कायम ठेवा जर नवीन नसेल तर

  try {
    if (req.files?.galleryPhoto?.[0]) {
      fileDetails = await uploadToAws({
        file: req.files.galleryPhoto[0],
        fileName: `gallery_update_${Date.now()}`,
        folderName: "Gallery",
      });
    }
  } catch (error) {
    console.log("Update करताना AWS एरर आला...");
  }

  const dataToUpdate = {
    ...req.body,
    photo: fileDetails,
    tags:
      req.body.tags && typeof req.body.tags === "string"
        ? req.body.tags.split(",").map((t) => t.trim())
        : item.tags,
  };

  const updatedItem = await Gallery.findByIdAndUpdate(
    req.params.id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    },
  );

  return sendResponse(
    res,
    200,
    true,
    "गॅलरी यशस्वीरित्या अपडेट झाली.",
    updatedItem,
  );
});

// Get All Gallery Items
const getAllGallery = asyncHandler(async (req, res) => {
  const items = await Gallery.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, true, "गॅलरी डेटा मिळाला.", items);
});

// Delete Gallery
const deleteGallery = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) return sendResponse(res, 404, false, "आयटम सापडला नाही.");

  await item.deleteOne();
  return sendResponse(res, 200, true, "गॅलरी आयटम हटवला.");
});

module.exports = { createGallery, getAllGallery, updateGallery, deleteGallery };
