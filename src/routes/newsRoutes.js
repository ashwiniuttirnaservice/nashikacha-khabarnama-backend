const { Router } = require("express");
const {
  createNews,
  getAllNew,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
} = require("../controllers/newsController");
const upload = require("../middleware/multer");
const { compressImages } = require("../utils/compressImages");
const authMiddleware = require("../middleware/authMiddleware");
const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "newsImage", maxCount: 1 }]),
  compressImages,
  createNews,
);

router.get("/all", getAllNew);
router.get("/", authMiddleware, getAllNews);
router
  .route("/:id")
  .get(getNewsById)
  .put(
    authMiddleware,
    upload.fields([{ name: "newsImage", maxCount: 1 }]),
    compressImages,
    updateNews,
  )
  .delete(deleteNews);

module.exports = router;
