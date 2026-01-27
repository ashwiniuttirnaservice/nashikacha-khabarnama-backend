
const { Router } = require("express");
const {
    createBreakingNews,
    getLiveBreaking,
    triggerNotification,
    deleteBreaking
} = require("../controllers/breakingNewsController");

const router = Router();

router.route("/")
    .post(createBreakingNews)
    .get(getLiveBreaking); // Usually frontend only calls "live" news

router.route("/notify/:id")
    .post(triggerNotification);

router.route("/:id")
    .delete(deleteBreaking);

module.exports = router;