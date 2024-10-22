import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { Transaction } from "../models/Transaction.model.js";
import ApiResponse from "../utils/ApiResponse.js";

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

  const { amount } = req.body;
  const description = req.body?.description || "";

  if (!amount) {
    throw new ApiError(400, "Amount is required");
  }
  const roundedAmount = Math.round(amount * 100) / 100;
  if (roundedAmount < 0.1 && roundedAmount > -0.1) {
    throw new ApiError(400, "Amount should be greater than 0.1");
  }

  const isAdded = await Transaction.create({
    amount: roundedAmount,
    description: description,
    sender: user._id,
    receiver: friend._id,
    status: amount < 0 ? "completed" : "pending",
  });

  if (!isAdded) {
    throw new ApiError(500, "Transaction failed");
  }

  const response = new ApiResponse(200, {}, "Transaction added successfully");
  res.status(200).json(response);
});

export { addTransaction };
