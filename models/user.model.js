import mongoose from "mongoose";
const { Schema, model } = mongoose;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  fullname: {
    type: String,
    required: ["true", "Name is Required"],
    minLength: [5, "Name Should must have 5 character"],
    maxLength: [50, "Name Should must below 50 character"],
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: ["true", "Email is Required"],
    unique: ["true", "Email should be unique"],
    lowercase: true,
    trim: true,
    match: [
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
      "Plzz give valid email",
    ],
  },

  password: {
    type: String,
    required: ["true", "Password is Required"],
    minLength: [5, "Minimum length is 5"],
    select: false,
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },

  avatar: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },

  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
});

userSchema.pre("save", async () => {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods = {
  comparePassword: async function (plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, this.password);
  },
  generateJWTToken: function () {
    return jwt.sign(
      {
        id: this._id,
        role: this.role,
        email: this.email,
        subscription: this.subscription,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },
};

const User = model("User", userSchema);
export default User;
