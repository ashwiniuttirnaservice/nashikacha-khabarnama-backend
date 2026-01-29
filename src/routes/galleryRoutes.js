const { Router } = require("express");
const {
  createGallery,
  getAllGallery,
  updateGallery,
  deleteGallery,
} = require("../controllers/galleryController");
const upload = require("../middleware/multer");
const { compressImages } = require("../utils/compressImages");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.route("/").get(getAllGallery);

router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "galleryPhoto", maxCount: 1 }]),
  createGallery,
  compressImages,
);

router.put(
  "/:id",
  authMiddleware,
  upload.fields([{ name: "galleryPhoto", maxCount: 1 }]),
  updateGallery,
  compressImages,
);

router
  .route("/:id")

  .delete(deleteGallery);

module.exports = router;
