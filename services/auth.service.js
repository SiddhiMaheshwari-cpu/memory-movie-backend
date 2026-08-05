const User = require("../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/tok.service");

const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("Please provide all required fields.");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Please provide email and password.");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (userId) => {
  return {
    message: "User logged out successfully.",
  };
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};