import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return res.status(431).json({ message: "Unauthorized" });
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(432).json({ message: "User does not exist" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(433).json({ message: "Unauthorized" });
  }
});
