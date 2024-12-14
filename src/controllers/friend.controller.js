import { User } from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Friend } from "../models/Friend.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Transaction } from "../models/Transaction.model.js";

const getAllFriends = asyncHandler(async (req, res) => {
  const username = req.user.username;

  const user = await User.findOne({ username }).select("_id");

  if (!user) {
    throw new ApiResponse(404, "User not found");
  }

  const friendsId = await Friend.find({
    $or: [{ userId: user._id }, { friendId: user._id }],
  });

  const friends = await Promise.all(
    friendsId.map(async (friend) => {
      if (friend.userId.toString() === user._id.toString()) {
        return await User.findById(friend.friendId).select(
          "username email profilePicture"
        );
      }
      return await User.findById(friend.userId).select(
        "username email profilePicture"
      );
    })
  );

  const response = new ApiResponse(200, friends, "All friends");
  res.status(response.statusCode).json(response);
});

const deleteFriend = asyncHandler(async (req, res) => {
  const username = req.user.username;
  const friendUsername = req.params.username;

  const { forced } = req.body;

  const user = await User.findOne({ username }).select("_id");

  if (!user) {
    throw new ApiResponse(404, "User not found");
  }

  const friend = await User.findOne({ username: friendUsername }).select("_id");

  if (!friend) {
    throw new ApiResponse(404, "Friend not found");
  }

  const friendShip = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: friend._id },
      { userId: friend._id, friendId: user._id },
    ],
  });

  if (!friendShip) {
    throw new ApiResponse(404, "Friendship not found");
  }

  const transaction = await Transaction.find({
    $or: [
      { sender: user._id, receiver: friend._id, status: "completed" },
      { sender: friend._id, receiver: user._id, status: "completed" },
    ],
  });

  let totalAmount = 0;

  transaction.map((tran) => {
    if (tran.sender === user._id) {
      totalAmount += tran.amount;
    } else {
      totalAmount -= tran.amount;
    }
  });

  if (totalAmount < 0) {
    throw new ApiResponse(400, "You have to return the loan first");
  }

  if (totalAmount > 0 && !forced) {
    throw new ApiResponse(405, "Your friend has to return the loan first");
  }

  await Friend.findByIdAndDelete(friendShip._id);

  const response = new ApiResponse(200, {}, "Friend removed");
  res.status(response.statusCode).json(response);
});

export { getAllFriends, deleteFriend };
