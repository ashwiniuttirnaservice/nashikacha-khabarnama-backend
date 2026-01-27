const { Router } = require("express");
const {
  saveRashi,
  getAllRashi,
  getRashiByName,
  getRashiById,
  updateRashi,
  deleteRashi,
} = require("../controllers/rashiController");

const router = Router();

router.route("/").get(getAllRashi).post(saveRashi);

router.route("/:name").get(getRashiByName);

router.route("/id/:id").get(getRashiById);
router.route("/:id").put(updateRashi).delete(deleteRashi);

module.exports = router;
