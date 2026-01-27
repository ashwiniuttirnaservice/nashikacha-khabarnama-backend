const { Router } = require("express");
const { createGallery, getAllGallery, updateGallery, deleteGallery } = require("../controllers/galleryController");
const upload = require("../middleware/multer");

const router = Router();

router.route("/")
    .get(getAllGallery)
    .post(upload.single("galleryPhoto"), createGallery);

router.route("/:id")
    .put(upload.single("galleryPhoto"), updateGallery)
    .delete(deleteGallery);

module.exports = router;