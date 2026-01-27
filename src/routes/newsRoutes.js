const { Router } = require("express");
const {
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews
} = require("../controllers/newsController");
const upload = require("../middleware/multer");

const router = Router();


router.route("/")
    .post(upload.single("newsImage"), createNews)
    .get(getAllNews);


router.route("/:id")
    .get(getNewsById)
    .put(upload.single("newsImage"), updateNews)
    .delete(deleteNews);

module.exports = router;