const { Router } = require("express");
const {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo
} = require("../controllers/videoController");

const router = Router();

router.route("/")
    .get(getAllVideos)
    .post(createVideo);

router.route("/:id")
    .get(getVideoById)
    .put(updateVideo)
    .delete(deleteVideo);

module.exports = router;