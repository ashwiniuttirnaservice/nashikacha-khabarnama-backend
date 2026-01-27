const Admin = require("../models/admin");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const jwt = require("jsonwebtoken");
/**
 * @desc    Register a new Admin
 * @route   POST /api/v1/admin/register
 */
const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const existedAdmin = await Admin.findOne({ email });
  if (existedAdmin) {
    return sendResponse(
      res,
      400,
      false,
      "Admin with this email already exists",
    );
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
    role,
  });

  const adminData = admin.toObject();
  delete adminData.password;

  return sendResponse(
    res,
    201,
    true,
    "Admin registered successfully",
    adminData,
  );
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) return sendResponse(res, 401, false, "Invalid credentials");

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return sendResponse(res, 401, false, "Invalid credentials");

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return sendResponse(res, 200, true, "Login successful", { token });
});

const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id);
  return sendResponse(res, 200, true, "Profile fetched", admin);
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { fullName, role, password } = req.body;
  const admin = await Admin.findById(req.params.id);

  if (!admin) return sendResponse(res, 404, false, "Admin not found");

  if (fullName) admin.fullName = fullName;
  if (role) admin.role = role;
  if (password) admin.password = password;

  await admin.save();
  return sendResponse(res, 200, true, "Admin updated successfully");
});

// 4. Delete Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  return sendResponse(res, 200, true, "Admin removed");
});

module.exports = {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateAdmin,
  deleteAdmin,
};
