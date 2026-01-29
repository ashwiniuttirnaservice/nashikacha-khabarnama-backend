const News = require("../models/news");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const path = require("path");
const fs = require("fs");
const uploadToAws = require("../help/awsUpload.js");

/**
 * @desc    Create a new news article (with AWS Upload and safe slug)
 * @route   POST /api/v1/news
 * @access  Private/Admin
 */
const createNews = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    category,
    breakingNews = "No",
    priority = "3",
    shortDescription,
    content,
    tags,
    seoTitle,
    seoDescription,
    publishDate,
    status = "Draft",
  } = req.body; // Required fields validation

  if (
    [title, category, content, shortDescription].some(
      (f) => !f || f.trim() === "",
    )
  ) {
    return sendResponse(res, 400, false, "कृपया सर्व आवश्यक माहिती भरा.");
  } // Generate slug safely

  let finalSlug =
    slug && slug.trim() !== ""
      ? slug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
  finalSlug += `-${Date.now()}`; // timestamp ensures uniqueness
  // Extra check: ensure slug is unique in DB

  const existingNews = await News.findOne({ slug: finalSlug });
  if (existingNews) {
    finalSlug += `-${Math.floor(Math.random() * 1000)}`; // random suffix
  } // Handle image upload

  let fileDetails = null;
  if (req.files?.newsImage?.[0]) {
    try {
      fileDetails = await uploadToAws({
        file: req.files.newsImage[0],
        fileName: `news_${Date.now()}`,
        folderName: "News",
      });
    } catch (err) {
      console.error("AWS Upload Error:", err.message);
      if (status === "Published") {
        return sendResponse(
          res,
          500,
          false,
          "इमेज अपलोड करण्यात अडचण आली, कृपया पुन्हा प्रयत्न करा.",
        );
      }
    }
  } // For Published news, image is mandatory

  if (!fileDetails && status === "Published") {
    return sendResponse(res, 400, false, "Published news requires an image.");
  } // Process tags

  const processedTags =
    typeof tags === "string"
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== "")
      : tags; // Create news

  const news = await News.create({
    title,
    slug: finalSlug,
    category,
    reporterName: req.user.fullName,
    breakingNews,
    priority,
    shortDescription,
    content,
    image: fileDetails,
    tags: processedTags,
    seoTitle,
    seoDescription,
    publishDate: publishDate || Date.now(),
    status,
    adminId: req.user.id,
  });

  return sendResponse(res, 201, true, "बातमी यशस्वीरित्या तयार झाली!", news);
});

/**
 * @desc    Get all news (optionally by category)
 * @route   GET /api/v1/news/all
 * @access  Public
 */
const getAllNew = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = category ? { category } : {};
  const news = await News.find(query).sort({ createdAt: -1 });
  return sendResponse(res, 200, true, "News fetched successfully", news);
});

/**
 * @desc    Get all news (role-based)
 * @route   GET /api/v1/news
 * @access  Private
 */
const getAllNews = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendResponse(res, 401, false, "लॉगिन करणे आवश्यक आहे.");
  }

  let query = {};
  if (req.user.role === "Panel") {
    query = { adminId: req.user.id };
  }

  const news = await News.find(query).sort({ createdAt: -1 });
  return sendResponse(res, 200, true, "बातम्यांची यादी प्राप्त झाली.", news);
});

/**
 * @desc    Get single news by ID
 * @route   GET /api/v1/news/:id
 * @access  Private
 */
const getNewsById = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return sendResponse(res, 404, false, "बातमी सापडली नाही."); // Panel users can only access their own news

  if (req.user?.role === "Panel" && news.adminId.toString() !== req.user.id) {
    return sendResponse(
      res,
      403,
      false,
      "तुम्हाला ही बातमी पाहण्याची परवानगी नाही.",
    );
  }

  return sendResponse(res, 200, true, "बातमी प्राप्त झाली.", news);
});

/**
 * @desc    Update news article
 * @route   PUT /api/v1/news/:id
 * @access  Private
 */
const updateNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return sendResponse(res, 404, false, "बातमी सापडली नाही.");

  if (req.user.role === "Panel" && news.adminId.toString() !== req.user.id) {
    return sendResponse(res, 403, false, "तुम्ही ही बातमी बदलू शकत नाही.");
  }

  const dataToUpdate = { ...req.body }; // Handle tags

  if (req.body.tags) {
    dataToUpdate.tags =
      typeof req.body.tags === "string"
        ? req.body.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== "")
        : req.body.tags;
  } // Handle image update

  if (req.files?.newsImage?.[0]) {
    try {
      const fileDetails = await uploadToAws({
        file: req.files.newsImage[0],
        fileName: `news_update_${Date.now()}`,
        folderName: "News",
      });
      dataToUpdate.image = fileDetails; // Optionally delete old image (if stored locally)

      if (news.image && news.image?.Location) {
        // You can implement AWS delete logic here if needed
      }
    } catch (err) {
      console.error("AWS Update Error:", err.message);
    }
  }

  const updatedNews = await News.findByIdAndUpdate(
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
    "बातमी यशस्वीरित्या अपडेट झाली.",
    updatedNews,
  );
});

/**
 * @desc    Delete news article
 * @route   DELETE /api/v1/news/:id
 * @access  Private
 */
const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) return sendResponse(res, 404, false, "बातमी सापडली नाही.");

  if (req.user.role === "Panel" && news.adminId.toString() !== req.user.id) {
    return sendResponse(res, 403, false, "तुम्ही ही बातमी डिलीट करू शकत नाही.");
  } // Delete image from AWS (optional)

  if (news.image && news.image?.Location) {
    // Add AWS delete logic here if you want to remove old files
  }

  await news.deleteOne();
  return sendResponse(res, 200, true, "बातमी यशस्वीरित्या डिलीट करण्यात आली.");
});

module.exports = {
  createNews,
  getAllNew,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
};
