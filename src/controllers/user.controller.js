import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (id) => {
  const user = await User.findById(id);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  if (
    [username, name, email, password].some((field) => {
      return !field || field.trim() === "";
    })
  ) {
    res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({
      status: "error",
      message: "Password must be at least 6 characters",
    });
    return;
  }

  const exist = await User.exists({ username });
  if (exist) {
    res.status(403).json({
      status: "error",
      message: "Username already exists",
    });
    return;
  }

  const existEmail = await User.exists({ email });
  if (existEmail) {
    res.status(403).json({
      status: "error",
      message: "Email already exists",
    });
    return;
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

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    res.status(500).json({
      status: "error",
      message: "User registration failed",
    });
    return;
  }

  console.log("user created", user.username);

  return res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: createdUser,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(410).json({
      status: "error",
      message: "User not found",
    });
  }

  const match = await user.isCorrectPassword(password);

  if (!match) {
    return res.status(411).json({
      status: "error",
      message: "Invalid username or password",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "username email name profilePicture -_id"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json({
      status: "success",
      message: "User logged in successfully",
      data: {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
    });
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const option = {
    httpOnly: true, // Prevents client-side access
    secure: true,
    sameSite: "None", // Needed for cross-origin cookies in production
  };

  res
    .clearCookie("refreshToken", option)
    .clearCookie("accessToken", option)
    .status(200)
    .json({
      status: "success",
      message: "User logged out successfully",
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      status: "error",
      message: "Refresh token is required",
    });
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded?._id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Invalid refresh token",
      });
    }

    const options = {
      httpOnly: true, // Prevents client-side access
      secure: true,
      sameSite: "None", // Needed for cross-origin cookies in production
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json({
        status: "success",
        message: "Access token refreshed successfully",
        data: {
          accessToken,
          refreshToken,
        },
      });
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid refresh token",
    });
  }
});

const getUser = asyncHandler(async (req, res) => {
  const username = req.user?.username;

  const user = await User.findOne({ username }).select(
    "username email name profilePicture"
  );

  if (!user) {
    res.status(410).json({
      status: "error",
      message: "User not found",
    });
    return;
  }

  return res.status(200).json({
    status: "success",
    user,
  });
});

const searchUser = asyncHandler(async (req, res) => {
  const searchQuery = req.query.search;

  const users1 = await User.find({
    $or: [{ username: { $regex: searchQuery, $options: "i" } }],
  }).select("username email name profilePicture");

  const users2 = await User.find({
    $or: [{ name: { $regex: searchQuery, $options: "i" } }],
  }).select("username email name profilePicture");

  const users = [...users1, ...users2];

  return res.status(200).json({
    status: "success",
    data: users,
  });
});

const userInfo = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const user = await User.findOne({ username: username }).select(
    "username email name profilePicture"
  );

  if (!user) {
    res.status(410).json({
      status: "error",
      message: "User not found",
    });
    return;
  }

  return res.status(200).json({
    status: "success",
    user,
  });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUser,
  searchUser,
  userInfo,
};
