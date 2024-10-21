import { User } from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Friend } from "../models/friends.model.js";
import { Request } from "../models/Request.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const sendRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const username = req.params.username;

  if (user.username === username) {
    throw new ApiError(400, "You cannot send a request to yourself");
  }

  const receiver = await User.findOne({ username });

  if (!receiver) {
    throw new ApiError(404, "User not found");
  }

  const isfriend = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: receiver._id },
      { userId: receiver._id, friendId: user._id },
    ],
  });

  if (isfriend) {
    throw new ApiError(400, "You are already friends with this user");
  }

  const requestExists = await Request.findOne({
    sender: user._id,
    receiver: receiver._id,
  });

  if (requestExists) {
    throw new ApiError(400, "You already sent a request to this user");
  }

  const otherUserAlreadySentRequest = await Request.findOne({
    sender: receiver._id,
    receiver: user._id,
  });

  if (otherUserAlreadySentRequest) {
    throw new ApiError(400, "You already have a request from this user");
  }

  const request = new Request({
    sender: user._id,
    receiver: receiver._id,
  });

  await request.save();

  return res.status(200).json(new ApiResponse(200, {}, "Request sent"));
});

export { sendRequest };
