const Admin = require("../models/admin");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");


// const uploadToAws = require("../help/awsUpload.js");

// const registerAdmin = asyncHandler(async (req, res) => {
//   const { fullName, email, password, role } = req.body;

//   // १. युजर आधीच आहे का ते तपासा
//   const existedAdmin = await Admin.findOne({ email });
//   if (existedAdmin) {
//     return sendResponse(res, 400, false, "या ईमेलचा ॲडमिन आधीच अस्तित्वात आहे.");
//   }

//   // २. इमेज अपलोड लॉजिक (जर फोटो पाठवला असेल तर)
//   // तात्पुरतं हे कमेंट करा किंवा TRY-CATCH मध्ये सुरक्षित ठेवा
//   let fileDetails = null;
//   try {
//     if (req.files?.profileImage?.[0]) {
//       fileDetails = await uploadToAws({
//         file: req.files.profileImage[0],
//         fileName: "admin_profile",
//         folderName: "admins",
//       });
//     }
//   } catch (awsError) {
//     console.log("AWS सर्व्हर डाऊन आहे, पण आम्ही नोंदणी पुढे चालू ठेवत आहोत...");
//     fileDetails = null; // फोटोशिवाय पुढे जा
//   }

//   // ३. डेटाबेसमध्ये एंट्री तयार करा
//   const admin = await Admin.create({
//     fullName,
//     email,
//     password,
//     role,
//     profileImage: fileDetails, // AWS कडून आलेला URL/Data इथे सेव्ह होईल
//     status: "Pending",        // डीफॉल्ट पेंडिंग
//     isLoggedIn: false         // सुरुवातीला लॉगिन परवानगी बंद
//   });

//   const adminData = admin.toObject();
//   delete adminData.password;

//   return sendResponse(
//     res,
//     201,
//     true,
//     "नोंदणी यशस्वी झाली! कृपया मुख्य ॲडमिनच्या मंजुरीची प्रतीक्षा करा.",
//     adminData
//   );
// });
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

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return sendResponse(res, 401, false, "ईमेल किंवा पासवर्ड चुकीचा आहे.");
  }


  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return sendResponse(res, 401, false, "ईमेल किंवा पासवर्ड चुकीचा आहे.");
  }


  if (admin.role === "Panel") {

    if (admin.isLoggedIn === false) {
      return sendResponse(
        res,
        403,
        false,
        "तुम्हाला लॉगिन करण्याची परवानगी नाही. कृपया मुख्य ॲडमिनशी संपर्क साधा."
      );
    }

    if (admin.status !== "Approved") {
      return sendResponse(
        res,
        403,
        false,
        `तुमचे खाते सध्या '${admin.status}' आहे. प्रवेश नाकारला.`
      );
    }
  }

  admin.lastLogin = Date.now();
  await admin.save();

  const token = jwt.sign(
    { id: admin._id, role: admin.role, fullName: admin.fullName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return sendResponse(res, 200, true, "लॉगिन यशस्वी झाले!", {
    token,
    role: admin.role,
  });
});

const toggleUserLogin = asyncHandler(async (req, res) => {

  if (req.user.role !== "Admin") {
    return sendResponse(res, 403, false, "तुम्हाला ही कृती करण्याची परवानगी नाही.");
  }

  const { userId } = req.params;

  const user = await Admin.findById(userId);

  if (!user) {
    return sendResponse(res, 404, false, "युजर सापडला नाही.");
  }


  user.isLoggedIn = !user.isLoggedIn;
  await user.save();

  const message = user.isLoggedIn
    ? `${user.fullName} ला लॉगिन परवानगी दिली आहे.`
    : `${user.fullName} ची लॉगिन परवानगी बंद केली आहे.`;

  return sendResponse(res, 200, true, message, {
    userId: user._id,
    isLoggedIn: user.isLoggedIn
  });
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
  toggleUserLogin,
  getProfile,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
};
