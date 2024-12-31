import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username already exists"],
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    profilePicture: {
      type: String,
    },

    refreshToken: {
      type: String,
    },

    fcmToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.isCorrectPassword = async function (password) {
  console.log(password, this.password);

  const res =  await bcrypt.compare(password, this.password);
  console.log(res)
  return res;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
