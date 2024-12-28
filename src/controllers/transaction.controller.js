import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { Transaction } from "../models/Transaction.model.js";
import { Friend } from "../models/Friend.model.js";

const addTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findOne({ _id: userId }).select(
    "username name profilePicture email"
  );

  const friendUsername = req.params.username;

  if (friendUsername === user.username) {
    return res.status(401).json({
      message: "You cannot send a transaction to yourself",
    });
  }

  const friend = await User.findOne({ username: friendUsername }).select(
    "username name profilePicture email"
  );

  if (!friend) {
    return res.status(402).json({ message: "Friend not found" });
  }

  const friendship = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: friend._id },
      { userId: friend._id, friendId: user._id },
    ],
  });

  if (!friendship) {
    return res
      .status(403)
      .json({ message: "You are not friends with this user" });
  }

  const { amount } = req.body;
  const description = req.body?.description || "";

  if (!amount) {
    return res.status(405).json({ message: "Amount is required" });
  }

  if (isNaN(amount)) {
    return res.status(405).json({ message: "Amount should be a number" });
  }

  if (amount > 10000000 || amount < -10000000) {
    return res
      .status(405)
      .json({ message: "Amount should be less than 10000000" });
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  if (roundedAmount < 1 && roundedAmount > -1) {
    return res.status(406).json({ message: "Amount should be greater than 1" });
  }

  const isAdded = await Transaction.create({
    amount: roundedAmount,
    description: description,
    sender: user._id,
    receiver: friend._id,
    status: amount < 0 ? "completed" : "pending",
  });

  if (!isAdded) {
    return res.status(500).json({ message: "Transaction failed" });
  }

  friendship.lastTransactionTime = new Date();
  friendship.isActive = true;
  await friendship.save();

  return res.status(200).json({
    message: "Transaction added successfully",
    transaction: { ...isAdded, sender: user },
  });
});

const showTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findOne({ _id: userId }).select(
    "username name profilePicture email fcmToken"
  );

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const friendUsername = req.params.username;

  if (friendUsername === user.username) {
    return res.status(401).json({
      message: "You cannot view transactions with yourself",
    });
  }

  const friend = await User.findOne({ username: friendUsername }).select(
    "username name profilePicture email fcmToken"
  );

  if (!friend) {
    return res.status(402).json({ message: "Friend not found" });
  }

  const friendship = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: friend._id },
      { userId: friend._id, friendId: user._id },
    ],
  });

  if (!friendship) {
    return res
      .status(403)
      .json({ message: "You are not friends with this user" });
  }

  const transactions = await Transaction.find({
    $or: [
      { sender: user._id, receiver: friend._id },
      { sender: friend._id, receiver: user._id },
    ],
  }).sort({ createdAt: -1 });

  const allTransaction = transactions.map((transaction) => {
    return {
      _id: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt,
      sender:
        transaction.sender.toString() === user._id.toString() ? user : friend,
    };
  });

  return res.status(200).json({ transactions: allTransaction, friend });
});

const acceptTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findOne({ _id: userId });

  const transactionId = req.params.transactioinId;

  const transaction = await Transaction.findOne({ _id: transactionId });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (transaction.receiver.toString() !== user._id.toString()) {
    return res
      .status(400)
      .json({ message: "You are not the receiver of this transaction" });
  }

  if (transaction.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Transaction already completed or rejected" });
  }

  transaction.status = "completed";
  await transaction.save();

  return res.status(200).json({ message: "Transaction accepted successfully" });
});

const denyTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findOne({ _id: userId });

  const transactionId = req.params.transactioinId;

  const transaction = await Transaction.findOne({ _id: transactionId });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (transaction.receiver.toString() !== user._id.toString()) {
    return res
      .status(400)
      .json({ message: "You are not the receiver of this transaction" });
  }

  if (transaction.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Transaction already completed or rejected" });
  }

  transaction.status = "rejected";
  await transaction.save();

  return res.status(200).json({ message: "Transaction denied successfully" });
});

const cancelTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findOne({ _id: userId });
  const transactionId = req.params.transactioinId;
  if (!transactionId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid transaction ID" });
  }

  const transaction = await Transaction.findOne({
    _id: transactionId,
  });

  if (!transaction) {
    return res.status(401).json({ message: "Transaction not found" });
  }

  if (transaction.sender.toString() !== user._id.toString()) {
    return res.status(402).json({ message: "You are not the sender" });
  }

  if (transaction.status !== "pending") {
    return res.status(403).json({ message: "Transaction already completed" });
  }

  const deleted = await Transaction.deleteOne({ _id: transactionId });

  if (!deleted) {
    return res.status(500).json({ message: "Transaction cancel failed" });
  }

  return res
    .status(200)
    .json({ message: "Transaction cancelled successfully" });
});

export {
  addTransaction,
  showTransactions,
  acceptTransaction,
  denyTransaction,
  cancelTransaction,
};
