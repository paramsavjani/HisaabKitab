import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";

const addTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findOne({ _id: userId });

  const friendUsername = req.params.username;

  if (friendUsername === user.username) {
    throw new ApiError(400, "You cannot send a transaction to yourself");
  }

  const friend = await User.findOne({ username: friendUsername });

  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  


});

export { addTransaction };
