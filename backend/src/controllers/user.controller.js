import asyncHandler from "../utils/asyncHandler.js";
import { UserDAL } from "../dal/UserDAL.js";
import { FriendDAL } from "../dal/FriendDAL.js";
import { TransactionDAL } from "../dal/TransactionDAL.js";
import { RequestDAL } from "../dal/RequestDAL.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

const generateAccessAndRefreshTokens = async (id) => {
  const user = await UserDAL.findById(id);
  const accessToken = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  const updatedUser = await UserDAL.update(id, { refreshToken });
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

  const exist = await UserDAL.findByUsername(username);
  if (exist) {
    return res.status(400).json({
      status: "error",
      message: "Username already exists",
    });
  }

  const existEmail = await UserDAL.search(email);
  if (existEmail.length > 0) {
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

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a proper MongoDB ObjectId
  const { ObjectId } = await import('mongodb');
  const userId = new ObjectId();
  
  const userData = {
    _id: userId,
    username,
    name,
    email,
    password: hashedPassword,
    profilePicture: imageUrl,
  };

  const createdUser = await UserDAL.create(userData);
  if (!createdUser) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create user",
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

  const user = await UserDAL.findByUsername(username);

  if (!user) {
    return res.status(410).json({
      status: "error",
      message: "User not found",
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(411).json({
      status: "error",
      message: "Invalid username or password",
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = {
    username: user.username,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture,
  };

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
    { $set: { refreshToken: "", fcmToken: "" } },
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

  const user = await UserDAL.findByUsername(username);
  if (!user) {
    res.status(410).json({
      status: "error",
      message: "User not found",
    });
    return;
  }

  const friends = await FriendDAL.findByUserId(user._id);
  const transactions = await TransactionDAL.findByUserId(user._id);

  const friendMap = {};
  const isActiveMap = {};

  friends.forEach((connection) => {
    const friendId =
      connection.userId.toString() === user._id.toString()
        ? connection.friendId.toString()
        : connection.userId.toString();

    friendMap[friendId] = connection.lastTransactionTime;
    isActiveMap[friendId] = connection.isActive;
  });

  const friendIds = Object.keys(friendMap);

  // Fetch user details
  const friendsDetail = await UserDAL.findByIds(friendIds);

  const finalFriends = friendsDetail.map((friend) => {
    return {
      _id: friend._id,
      username: friend.username,
      name: friend.name,
      profilePicture: friend.profilePicture,
      fcmToken: friend.fcmToken,
      lastTransactionTime: friendMap[friend._id.toString()],
      isActive: isActiveMap[friend._id.toString()],
    };
  });

  const transactionMap = {};

  transactions.forEach((transaction) => {
    if (transaction.status === "completed") {
      if (transaction.sender.toString() === user._id.toString()) {
        transactionMap[transaction.receiver.toString()] =
          (transactionMap[transaction.receiver.toString()] || 0) +
          transaction.amount;
      } else {
        transactionMap[transaction.sender.toString()] =
          (transactionMap[transaction.sender.toString()] || 0) -
          transaction.amount;
      }
    }
  });

  const result = finalFriends.map((friend) => {
    const totalAmount = transactionMap[friend._id.toString()] || 0;
    return {
      ...friend,
      totalAmount,
    };
  });

  return res.status(200).json({
    status: "success",
    user,
    friends: result,
    transactions,
  });
});

const searchUser = asyncHandler(async (req, res) => {
  const searchQuery = req.query.search;

  const users = await UserDAL.search(searchQuery);

  return res.status(200).json({
    status: "success",
    data: users,
  });
});

const userInfo = asyncHandler(async (req, res) => {
  const username = req.params.username;

  const user = await User.findOne({ username })
    .select("username email name profilePicture fcmToken")
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
