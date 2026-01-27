const Rashi = require("../models/rashi");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");

/**
 * @desc    Create or Update Rashi (Upsert)
 * @route   POST /api/v1/rashi
 */
const saveRashi = asyncHandler(async (req, res) => {
    const { rashi } = req.body;

    if (!rashi) {
        return sendResponse(res, 400, false, "Rashi name is required");
    }

    // This will update the Rashi if it exists, or create a new one if it doesn't
    const rashiData = await Rashi.findOneAndUpdate(
        { rashi: rashi },
        { ...req.body },
        { new: true, upsert: true, runValidators: true }
    );

    return sendResponse(res, 201, true, `Data for ${rashi} saved successfully`, rashiData);
});

/**
 * @desc    Get all Rashi data
 * @route   GET /api/v1/rashi
 */
const getAllRashi = asyncHandler(async (req, res) => {
    const rashis = await Rashi.find().sort({ rashi: 1 });
    return sendResponse(res, 200, true, "All Rashi data fetched", rashis);
});

/**
 * @desc    Get single Rashi by name
 * @route   GET /api/v1/rashi/:name
 */
const getRashiByName = asyncHandler(async (req, res) => {
    const data = await Rashi.findOne({ rashi: req.params.name });

    if (!data) {
        return sendResponse(res, 404, false, "Rashi not found");
    }

    return sendResponse(res, 200, true, "Rashi details fetched", data);
});


/**
 * @desc    Get single Rashi by ID
 * @route   GET /api/v1/rashi/id/:id
 */
const getRashiById = asyncHandler(async (req, res) => {
    const rashi = await Rashi.findById(req.params.id);

    if (!rashi) {
        return sendResponse(res, 404, false, "Rashi record not found");
    }

    return sendResponse(res, 200, true, "Rashi details fetched successfully", rashi);
});

/**
 * @desc    Update Rashi by ID
 * @route   PUT /api/v1/rashi/:id
 */
const updateRashi = asyncHandler(async (req, res) => {
    const rashi = await Rashi.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
    );

    if (!rashi) {
        return sendResponse(res, 404, false, "Rashi record not found");
    }

    return sendResponse(res, 200, true, "Rashi updated successfully", rashi);
});

/**
 * @desc    Delete Rashi by ID
 * @route   DELETE /api/v1/rashi/:id
 */
const deleteRashi = asyncHandler(async (req, res) => {
    const rashi = await Rashi.findByIdAndDelete(req.params.id);

    if (!rashi) {
        return sendResponse(res, 404, false, "Rashi record not found");
    }

    return sendResponse(res, 200, true, "Rashi record deleted successfully");
});

module.exports = {
    saveRashi,
    getAllRashi,
    getRashiByName,
    getRashiById,
    updateRashi,
    deleteRashi
};
