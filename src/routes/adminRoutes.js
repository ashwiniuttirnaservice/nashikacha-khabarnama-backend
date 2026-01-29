const { Router } = require("express");
const {
  registerAdmin,
  loginAdmin,
  toggleUserLogin, // Navin
  getProfile,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  getAllAdmins, // Navin
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/multer.js");

const router = Router();

router.post(
  "/register",
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  registerAdmin,
);
router.post("/login", loginAdmin);
router.put("/update-status/:id", updateAdminStatus);
router.get("/all", getAllAdmins);
router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/toggle-login/:userId", authMiddleware, toggleUserLogin);

router.put("/update/:id", updateAdmin);
router.delete("/delete/:id", deleteAdmin);

module.exports = router;
