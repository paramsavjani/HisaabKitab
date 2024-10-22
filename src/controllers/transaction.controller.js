import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { Transaction } from "../models/Transaction.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Friend } from "../models/Friend.model.js";

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

  const friendship = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: friend._id },
      { userId: friend._id, friendId: user._id },
    ],
  });

  if (!friendship) {
    throw new ApiError(400, "You are not friends with this user");
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

const showTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const friendUsername = req.params.username;

  if (friendUsername === user.username) {
    throw new ApiError(400, "You cannot fetch transactions of yourself");
  }

  const friend = await User.findOne({ username: friendUsername });

  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  const friendship = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: friend._id },
      { userId: friend._id, friendId: user._id },
    ],
  });

  if (!friendship) {
    throw new ApiError(400, "You are not friends with this user");
  }

  const transactions = await Transaction.find({
    $or: [
      { sender: user._id, receiver: friend._id },
      { sender: friend._id, receiver: user._id },
    ],
  }).sort({ createdAt: -1 });

  const allTransaction = transactions.map((transaction) => {
    return {
      transactionId: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt,
      from: transaction.sender === user._id ? user.username : friend.username,
    };
  });

  const response = new ApiResponse(
    200,
    allTransaction,
    "Transactions fetched successfully"
  );
  res.status(200).json(response);
});

const acceptTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findOne({ _id: userId });

  const transactionId = req.params.transactioinId;

  const transaction = await Transaction.findOne({ _id: transactionId });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  if (transaction.receiver.toString() !== user._id.toString()) {
    throw new ApiError(400, "You are not the receiver of this transaction");
  }

  if (transaction.status !== "pending") {
    throw new ApiError(400, "Transaction already completed or rejected");
  }

  transaction.status = "completed";
  await transaction.save();

  const response = new ApiResponse(
    200,
    {},
    "Transaction accepted successfully"
  );
  res.status(200).json(response);
});

const denyTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findOne({ _id: userId });

  const transactionId = req.params.transactioinId;

  const transaction = await Transaction.findOne({ _id: transactionId });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  if (transaction.receiver.toString() !== user._id.toString()) {
    throw new ApiError(400, "You are not the receiver of this transaction");
  }

  if (transaction.status !== "pending") {
    throw new ApiError(400, "Transaction already completed or rejected");
  }

  transaction.status = "rejected";
  await transaction.save();

  const response = new ApiResponse(200, {}, "Transaction denied successfully");

  res.status(200).json(response);
});

const cancelTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findOne({ _id: userId });
  const transactionId = req.params.transactioinId;
  if (!transactionId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid transaction ID");
  }

  const transaction = await Transaction.findOne({
    _id: transactionId,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  if (transaction.sender.toString() !== user._id.toString()) {
    throw new ApiError(400, "You are not the sender of this transaction");
  }

  if (transaction.status !== "pending") {
    throw new ApiError(400, "Transaction already completed or rejected");
  }

  const deleted = await Transaction.deleteOne({ _id: transactionId });

  if (!deleted) {
    throw new ApiError(500, "Transaction cancelation failed");
  }

  const response = new ApiResponse(
    200,
    {},
    "Transaction canceled successfully"
  );
  res.status(200).json(response);
});

export {
  addTransaction,
  showTransactions,
  acceptTransaction,
  denyTransaction,
  cancelTransaction,
};
