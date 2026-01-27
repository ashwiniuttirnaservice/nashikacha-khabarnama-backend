const { Router } = require("express");
const {
    registerAdmin, loginAdmin, getProfile, updateAdmin, deleteAdmin
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

// Public Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected Routes (Require Token)
router.get("/profile", authMiddleware, getProfile);
router.put("/update/:id", authMiddleware, updateAdmin);
router.delete("/delete/:id", authMiddleware, deleteAdmin);

module.exports = router;