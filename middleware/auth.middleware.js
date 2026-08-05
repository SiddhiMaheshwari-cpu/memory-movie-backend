const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No Token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
    console.log("AUTH HEADER:", req.headers.authorization);
    console.log("TOKEN:", token);

    // Verify Token

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Find User
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  protect,
};
