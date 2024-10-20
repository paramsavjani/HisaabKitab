import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  if (
    [username, name, email, password].some((field) => {
      return !field || field.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const exist = await User.exists({ username });
  if (exist) {
    throw new ApiError(400, "Username already exists");
  }

  const existEmail = await User.exists({ email });
  if (existEmail) {
    throw new ApiError(400, "Email already exists");
  }

  const profilePicture = req.file ? req.file.path : null;
  let imageUrl = "";
  if (profilePicture) {
    imageUrl = await uploadOnCloudinary(profilePicture);
  }

  const user = await User.create({
    username,
    name,
    email,
    password,
    profilePicture: imageUrl,
  });

  res.status(200).json(user);
});

export { registerUser };
