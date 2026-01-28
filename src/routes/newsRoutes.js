const { Router } = require("express");
const {
    createNews,
    getAllNew,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews
} = require("../controllers/newsController");
const upload = require("../middleware/multer");
const authMiddleware = require("../middleware/authMiddleware");
const router = Router();


router.route("/")
    .post(upload.single("newsImage"), authMiddleware, createNews)

router.get("/all", getAllNew);
router.get("/", authMiddleware, getAllNews);
router.route("/:id")
    .get(getNewsById)
    .put(upload.single("newsImage"), updateNews)
    .delete(deleteNews);

module.exports = router;