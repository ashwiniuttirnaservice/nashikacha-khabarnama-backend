const News = require("../models/news");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

/**
 * @desc    Create a new news article
 * @route   POST /api/v1/news
 * @access  Private/Admin
 */

const createNews = asyncHandler(async (req, res) => {
    const {
        title,
        slug,
        category,
        reporterName,
        breakingNews,
        priority,
        shortDescription,
        content,
        tags,
        seoTitle,
        seoDescription,
        publishDate,
        status
    } = req.body;


    if ([title, slug, category, reporterName, content].some((field) => !field || field.trim() === "")) {
        return sendResponse(res, 400, false, "All required fields must be filled");
    }


    const existedNews = await News.findOne({ slug });
    if (existedNews) {
        return sendResponse(res, 409, false, "News with this slug already exists");
    }


    const processedTags = typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
        : tags;


    const imagePath = req.file ? req.file.filename : null;

    if (!imagePath && status === "Published") {
        return sendResponse(res, 400, false, "Image is required for published news");
    }


    const news = await News.create({
        title,
        slug,
        category,
        reporterName,
        breakingNews,
        priority,
        shortDescription,
        content,
        image: imagePath,
        tags: processedTags,
        seoTitle,
        seoDescription,
        publishDate: publishDate || Date.now(),
        status
    });


    return sendResponse(res, 201, true, "News article created successfully", news);
});


/**
 * @desc    Get all news articles
 * @route   GET /api/v1/news
 */
const getAllNews = asyncHandler(async (req, res) => {
    const news = await News.find().sort({ createdAt: -1 });

    return sendResponse(res, 201, true, "News article fetch  successfully", news);
});



/**
 * @desc    Get single news article by ID
 * @route   GET /api/v1/news/:id
 */
const getNewsById = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        return sendResponse(res, 404, false, "News article not found");
    }

    return sendResponse(res, 200, true, "News article fetched successfully", news);
});

/**
 * @desc    Update news article
 * @route   PUT /api/v1/news/:id
 */
const updateNews = asyncHandler(async (req, res) => {
    let news = await News.findById(req.params.id);

    if (!news) {
        return sendResponse(res, 404, false, "News article not found");
    }

    const dataToUpdate = { ...req.body };

    // Handle Tags if provided
    if (req.body.tags) {
        dataToUpdate.tags = typeof req.body.tags === 'string'
            ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
            : req.body.tags;
    }

    // Handle Image Update
    if (req.file) {
        // Delete old image if it exists
        if (news.image) {
            const oldPath = path.join(__dirname, "../../uploads/News", news.image);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        dataToUpdate.image = req.file.filename;
    }

    news = await News.findByIdAndUpdate(req.params.id, dataToUpdate, {
        new: true,
        runValidators: true,
    });

    return sendResponse(res, 200, true, "News article updated successfully", news);
});

/**
 * @desc    Delete news article
 * @route   DELETE /api/v1/news/:id
 */
const deleteNews = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        return sendResponse(res, 404, false, "News article not found");
    }

    // Delete image file from server
    if (news.image) {
        const imagePath = path.join(__dirname, "../../uploads/News", news.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await news.deleteOne();

    return sendResponse(res, 200, true, "News article and associated image deleted successfully");
});

module.exports = {
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews
};
