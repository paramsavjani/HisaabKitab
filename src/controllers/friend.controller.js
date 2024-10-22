import { User } from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Friend } from "../models/friends.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const getAllFriends = asyncHandler(async (req, res) => {
  const username = req.user.username;

  const user = await User.findOne({ username }).select("_id");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
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

  const user = await User.findOne({ username }).select("_id");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const friend = await User.findOne({ username: friendUsername }).select("_id");

  if (!friend) {
    return res.status(404).json({ message: "Friend not found" });
  }

  const friendShip = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: friend._id },
      { userId: friend._id, friendId: user._id },
    ],
  });

  if (!friendShip) {
    return res.status(404).json({ message: "Friendship not found" });
  }

  await Friend.findByIdAndDelete(friendShip._id);

  const response = new ApiResponse(200, {}, "Friend removed");
  res.status(response.statusCode).json(response);
});

export { getAllFriends, deleteFriend };