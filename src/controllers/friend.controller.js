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

  console.log(friends);

  const response = new ApiResponse(200, friends, "All friends");
  res.status(response.statusCode).json(response);
});

export { getAllFriends };
