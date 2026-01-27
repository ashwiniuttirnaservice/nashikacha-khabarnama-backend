const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded now contains { id: "...", role: "...", iat: ..., exp: ... }
      req.user = decoded;

      next();
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Token is invalid or expired" });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
});

module.exports = authMiddleware;
