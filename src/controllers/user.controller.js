import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";

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
    console.log(exist); 
    throw new ApiError(400, "Username already exists");
  }

  const existEmail = await User.exists({ email });
  if (existEmail) {
    throw new ApiError(400, "Email already exists");
  }

  const user = await User.create({ username, name, email, password });

  res.status(201).json(user);
});

export { registerUser };
