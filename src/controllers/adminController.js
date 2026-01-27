const Admin = require("../models/admin");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

// 1. Register Admin (Default status 'Pending' asel)
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
    role, // Model madhe default status 'Pending' asel
  });

  const adminData = admin.toObject();
  delete adminData.password;

  return sendResponse(
    res,
    201,
    true,
    "Registration यशस्वी! Admin approval chi pratiksha kara.",
    adminData,
  );
});

// 2. Login Admin (Status check ani isLoggedIn ON)
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) return sendResponse(res, 401, false, "Invalid credentials");

  // Check Status - Fakt 'Approved' users login karu shaktat
  if (admin.status !== "Approved") {
    return sendResponse(
      res,
      403,
      false,
      `Tumche account ${admin.status} aahe. Admin shi sampark sadha.`,
    );
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return sendResponse(res, 401, false, "Invalid credentials");

  // Update Login Status
  admin.isLoggedIn = true;
  admin.lastLogin = Date.now();
  await admin.save();

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return sendResponse(res, 200, true, "Login यशस्वी!", {
    token,
    role: admin.role,
  });
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(req.user.id, { isLoggedIn: false });

  return sendResponse(res, 200, true, "Logout यशस्वी!");
});

// 4. Update Admin Status (Main Admin sathi)

const updateAdminStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Approved", "Rejected", "Suspended"];
  if (!validStatuses.includes(status)) {
    return sendResponse(res, 400, false, "Invalid status type");
  }

  // Password load karnyisathi .select("+password") vapra
  const admin = await Admin.findById(id).select("+password");

  if (!admin) {
    return sendResponse(res, 404, false, "Admin user sapadla nahi");
  }

  admin.status = status;
  await admin.save();

  if (status === "Approved") {
    const emailTemplate = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2ecc71;">Abhinandan! Tumche Account Approve Jale Aahe.</h2>
        <p>Namaskar <b>${admin.fullName}</b>,</p>
        <p>Tumhala Admin Panel cha access dila gela aahe. Tumche login details khaliil pramane aahet:</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
          <p><b>Email:</b> ${admin.email}</p>
          <p><b>Password:</b> ${admin.password}</p> 
        </div>
        <p>Krupaya login kelya-nantar password badlun ghyava.</p>
        <br>
        <p>Shubhechha,<br>Main Admin Team</p>
      </div>
    `;

    try {
      await sendEmail({
        email: admin.email,
        subject: "Admin Access Approved ✅",
        message: emailTemplate,
      });
    } catch (error) {
      console.log("Email Error: ", error);
      return sendResponse(
        res,
        500,
        false,
        "Status updated but email could not be sent.",
      );
    }
  }

  return sendResponse(
    res,
    200,
    true,
    `Admin status updated to ${status} and email sent!`,
  );
});
const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id);
  return sendResponse(res, 200, true, "Profile fetched", admin);
});

// 6. Update Admin Details
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

// 7. Delete Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  return sendResponse(res, 200, true, "Admin removed");
});

const getAllAdmins = asyncHandler(async (req, res) => {
  // Fetch all admins, exclude password
  const admins = await Admin.find().select("-password").sort({ createdAt: -1 });

  return sendResponse(res, 200, true, "Admins fetched successfully", admins);
});
module.exports = {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  logoutAdmin,
  getProfile,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
};
