const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const Admin = require("../models/admin"); // Admin मॉडेल इम्पोर्ट करा

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Admin.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ success: false, message: "युजर सापडला नाही" });
      }

      next();
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "टोकन चुकीचे आहे किंवा एक्स्पायर झाले आहे" });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "परवानगी नाही, टोकन मिळाले नाही" });
  }
});

module.exports = authMiddleware;