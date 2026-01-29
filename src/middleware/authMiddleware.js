const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      next();
    } catch (error) {
      res.status(401).json({ success: false, message: "टोकन चुकीचे आहे किंवा एक्स्पायर झाले आहे" });
    }
  } else {
    res.status(401).json({ success: false, message: "परवानगी नाही, टोकन मिळाले नाही" });
  }
});

module.exports = authMiddleware;