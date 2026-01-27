
const { Router } = require("express");
const {
    createBreakingNews,
    getLiveBreaking,
     getBreakingNewsById,
    triggerNotification,
    deleteBreaking,
    updateBreakingNews
} = require("../controllers/breakingNewsController");

const router = Router();

router.route("/")
    .post(createBreakingNews)
    .get(getLiveBreaking); // Usually frontend only calls "live" news

router.route("/notify/:id")
    .post(triggerNotification);

// ✅ UPDATE + DELETE
router.route("/:id")
 .get(getBreakingNewsById)   // ✅ GET BY ID
    .put(updateBreakingNews)   // UPDATE
    .delete(deleteBreaking);   // DELETE


module.exports = router;