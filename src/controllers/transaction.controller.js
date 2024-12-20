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

  console.log(isAdded);

  if (!isAdded) {
    return res.status(500).json({ message: "Transaction failed" });
  }

  friendship.lastTransactionTime = new Date();
  friendship.isActive = true;
  await friendship.save();

  return res
    .status(200)
    .json({
      message: "Transaction added successfully",
      transaction: { ...isAdded, sender: friend },
    });
});

const showTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findOne({ _id: userId });

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

const getActiveFriends = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch active friend relationships
    const activeFriends = await Friend.find(
      {
        $or: [{ userId }, { friendId: userId }],
        isActive: true,
      },
      { userId: 1, friendId: 1, lastTransactionTime: 1, _id: 0 }
    );

    if (!activeFriends.length) {
      return res.status(200).json({ friends: [] });
    }

    // Map friend IDs and lastTransactionTime
    const friendMap = {};
    activeFriends.forEach((connection) => {
      const friendId =
        connection.userId.toString() === userId.toString()
          ? connection.friendId.toString()
          : connection.userId.toString();

      friendMap[friendId] = connection.lastTransactionTime;
    });

    const friendIds = Object.keys(friendMap);

    // Fetch user details
    const friends = await User.find(
      { _id: { $in: friendIds } },
      {
        username: 1,
        name: 1,
        profilePicture: 1,
      }
    ).lean();

    // Aggregate transaction amounts for each friend
    const transactionCounts = await Transaction.find(
      {
        $or: [
          { sender: userId, receiver: { $in: friendIds } },
          { receiver: userId, sender: { $in: friendIds } },
        ],
        status: "completed", // Only completed transactions
      },
      {
        sender: 1,
        amount: 1,
        receiver: 1,
        status: 1,
      }
    ).lean();

    let totalTake = 0;
    let totalGive = 0;

    const transactionMap = {};
    transactionCounts.forEach((transaction) => {
      if (transaction.sender.toString() === userId.toString()) {
        transactionMap[transaction.receiver.toString()] =
          (transactionMap[transaction.receiver.toString()] || 0) +
          transaction.amount;
      } else {
        transactionMap[transaction.sender.toString()] =
          (transactionMap[transaction.sender.toString()] || 0) -
          transaction.amount;
      }
    });

    // Calculate totalTake and totalGive
    friendIds.forEach((friendId) => {
      const amount = transactionMap[friendId] || 0;
      if (amount > 0) {
        totalTake += amount;
      } else {
        totalGive -= amount;
      }
    });

    // Construct the final result
    const result = friends.map((friend) => {
      const totalAmount = transactionMap[friend._id.toString()] || 0; // Default to 0 if no transactions
      return {
        username: friend.username,
        name: friend.name,
        profilePicture: friend.profilePicture,
        lastTransactionTime: friendMap[friend._id.toString()],
        totalAmount: totalAmount, // Add total transaction amount
      };
    });

    return res.status(200).json({ friends: result, totalTake, totalGive });
  } catch (error) {
    console.error("Error fetching active friends:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export {
  addTransaction,
  showTransactions,
  acceptTransaction,
  denyTransaction,
  cancelTransaction,
  getActiveFriends,
};
