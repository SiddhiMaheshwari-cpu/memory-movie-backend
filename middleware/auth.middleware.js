const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    const isInvalid = error.name === "JsonWebTokenError";

    return res.status(401).json({
      success: false,
      message: isExpired
        ? "Your session has expired. Please log in again."
        : isInvalid
          ? "Invalid authentication token."
          : "Authentication failed.",
      code: isExpired ? "TOKEN_EXPIRED" : "AUTH_FAILED",
    });
  }
};

module.exports = {
  protect,
};
