const { Router } = require("express");
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin, // Navin
  getProfile,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  getAllAdmins, // Navin
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

/**
 * PUBLIC ROUTES
 */
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.put("/update-status/:id", updateAdminStatus);
router.get("/all", getAllAdmins);
router.use(authMiddleware);

router.get("/profile", getProfile);
router.post("/logout", logoutAdmin);

router.put("/update/:id", updateAdmin);
router.delete("/delete/:id", deleteAdmin);

module.exports = router;
