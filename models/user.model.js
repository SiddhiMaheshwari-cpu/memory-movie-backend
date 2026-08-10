const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);





// Hash Password Before Save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);