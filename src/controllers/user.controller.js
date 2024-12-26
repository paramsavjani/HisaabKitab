import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { Friend } from "../models/Friend.model.js";
import { Request } from "../models/Request.model.js";

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
    [username, name, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 6 characters",
    });
  }

  const exist = await User.findOne({ username });
  if (exist) {
    return res.status(400).json({
      status: "error",
      message: "Username already exists",
    });
  }

  const existEmail = await User.findOne({ email });
  if (existEmail) {
    return res.status(400).json({
      status: "error",
      message: "Email already exists",
    });
  }

  const profilePicture = req.file ? req.file.path : null;
  let imageUrl = "";
  if (profilePicture) {
    try {
      imageUrl = await uploadOnCloudinary(profilePicture);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Image upload failed",
      });
    }
  }

  // const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    name,
    email,
    password,
    profilePicture: imageUrl,
  });

  const createdUser = await User.findById(user._id).select(
    "email username name profilePicture"
  );
  if (!createdUser) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch created user",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    createdUser._id
  );

  const options = {
    httpOnly: false,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: {
          username: createdUser.username,
          email: createdUser.email,
          name: createdUser.name,
          profilePicture: createdUser.profilePicture,
        },
        accessToken,
        refreshToken,
      },
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

  const match = password === user.password;

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
    httpOnly: false,
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
    httpOnly: false, // Prevents client-side access
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
      httpOnly: false, // Prevents client-side access
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

  const users = await User.find({
    $or: [
      { username: { $regex: searchQuery, $options: "i" } },
      { name: { $regex: searchQuery, $options: "i" } },
    ],
  });

  return res.status(200).json({
    status: "success",
    data: users,
  });
});

const userInfo = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const user = await User.findOne({ username })
    .select("username email name profilePicture")
    .lean();

  if (!user) {
    return res.status(410).json({
      status: "error",
      message: "User not found",
    });
  }

  const totalFriends = await Friend.find({
    $or: [{ userId: user._id }, { friendId: user._id }],
  }).countDocuments();

  const accessToken =
    req.body.accessToken ||
    req.cookies.accessToken ||
    req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    return res.status(201).json({
      user: { ...user, totalFriends },
      status: "success",
    });
  }

  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const userId = decodedToken._id;
    const targetUserId = user._id;

    const [friendship, request] = await Promise.all([
      Friend.findOne({
        $or: [
          { userId: userId, friendId: targetUserId },
          { userId: targetUserId, friendId: userId },
        ],
      }),
      Request.findOne({
        $or: [
          { sender: userId, receiver: targetUserId },
          { sender: targetUserId, receiver: userId },
        ],
        status: "pending",
      }),
    ]);

    return res.status(200).json({
      status: "success",
      user: { ...user, totalFriends },
      friendship: !!friendship,
      requested: !!request,
      request: request || null,
    });
  } catch (error) {
    console.log(error);
    return res.status(201).json({
      user: { ...user, totalFriends },
      status: "success",
    });
  }
});

const fcmtoken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  const user = await User.findById(req.user._id);
  user.fcmToken = fcmToken;
  await user.save();
  return res.status(200).json({
    status: "success",
    message: "FCM token updated successfully",
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
  fcmtoken,
};
