const News = require("../models/news");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const path = require("path");
const fs = require("fs");

/**
 * @desc    Create a new news article
 * @route   POST /api/v1/news
 */
const createNews = asyncHandler(async (req, res) => {
    const {
        title, slug, category, breakingNews, priority,
        shortDescription, content, tags, seoTitle, seoDescription, publishDate, status
    } = req.body;

    // व्हॅलिडेशन (reporterName बॉडीमधून घेण्याची गरज नाही)
    if ([title, slug, category, content].some((field) => !field || field.trim() === "")) {
        return sendResponse(res, 400, false, "कृपया सर्व आवश्यक माहिती भरा.");
    }

    const existedNews = await News.findOne({ slug });
    if (existedNews) {
        return sendResponse(res, 409, false, "या नावाचा स्लॉग (Slug) आधीच अस्तित्वात आहे.");
    }

    // टॅग्स प्रोसेसिंग
    const processedTags = typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
        : tags;

    const imagePath = req.file ? req.file.filename : null;

    if (!imagePath && status === "Published") {
        return sendResponse(res, 400, false, "बातमी प्रसिद्ध करण्यासाठी इमेज अपलोड करणे आवश्यक आहे.");
    }

    // बातमी तयार करताना लॉगिन असलेल्या युजरचे नाव आणि आयडी वापरणे
    const news = await News.create({
        title,
        slug,
        category,
        reporterName: req.user.fullName, // लॉगिन असलेल्या युजरचे नाव आपोआप येईल
        breakingNews,
        priority,
        shortDescription,
        content,
        image: imagePath,
        tags: processedTags,
        seoTitle,
        seoDescription,
        publishDate: publishDate || Date.now(),
        status,
        adminId: req.user.id // फिल्टरिंगसाठी युजर आयडी
    });

    return sendResponse(res, 201, true, "बातमी यशस्वीरित्या तयार झाली!", news);
})

const getAllNew = asyncHandler(async (req, res) => {
    const { category } = req.query;
    let query = {};



    if (category) {
        query.category = category;
    }


    const news = await News.find(query).sort({ createdAt: -1 });

    return sendResponse(res, 200, true, "News fetched successfully", news);
});

/**
 * @desc    Get all news articles (Role Based Filtering)
 * @route   GET /api/v1/news
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
 * @desc    Get single news article by ID
 */
const getNewsById = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        return sendResponse(res, 404, false, "बातमी सापडली नाही.");
    }

    // सुरक्षा: जर पॅनेल युजर दुसऱ्याची न्यूज पाहण्याचा प्रयत्न करत असेल तर (Optional)
    if (req.user.role === "Panel" && news.adminId.toString() !== req.user.id) {
        return sendResponse(res, 403, false, "तुम्हाला ही बातमी पाहण्याची परवानगी नाही.");
    }

    return sendResponse(res, 200, true, "बातमी प्राप्त झाली.", news);
});

/**
 * @desc    Update news article
 */
const updateNews = asyncHandler(async (req, res) => {
    let news = await News.findById(req.params.id);

    if (!news) {
        return sendResponse(res, 404, false, "बातमी सापडली नाही.");
    }

    // पॅनेल युजर फक्त स्वतःचीच न्यूज अपडेट करू शकतो
    if (req.user.role === "Panel" && news.adminId.toString() !== req.user.id) {
        return sendResponse(res, 403, false, "तुम्ही ही बातमी बदलू शकत नाही.");
    }

    const dataToUpdate = { ...req.body };

    if (req.body.tags) {
        dataToUpdate.tags = typeof req.body.tags === 'string'
            ? req.body.tags.split(',').map(tag => tag.trim())
            : req.body.tags;
    }

    if (req.file) {
        if (news.image) {
            const oldPath = path.join(__dirname, "../../uploads/News", news.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        dataToUpdate.image = req.file.filename;
    }

    news = await News.findByIdAndUpdate(req.params.id, dataToUpdate, {
        new: true,
        runValidators: true,
    });

    return sendResponse(res, 200, true, "बातमी यशस्वीरित्या अपडेट झाली.", news);
});

/**
 * @desc    Delete news article
 */
const deleteNews = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        return sendResponse(res, 404, false, "बातमी सापडली नाही.");
    }

    // पॅनेल युजर फक्त स्वतःचीच न्यूज डिलीट करू शकतो
    if (req.user.role === "Panel" && news.adminId.toString() !== req.user.id) {
        return sendResponse(res, 403, false, "तुम्ही ही बातमी डिलीट करू शकत नाही.");
    }

    if (news.image) {
        const imagePath = path.join(__dirname, "../../uploads/News", news.image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
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
    deleteNews
};