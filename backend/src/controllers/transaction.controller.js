import asyncHandler from "../utils/asyncHandler.js";
import { UserDAL } from "../dal/UserDAL.js";
import { TransactionDAL } from "../dal/TransactionDAL.js";
import { FriendDAL } from "../dal/FriendDAL.js";

const addTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await UserDAL.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const friendUsername = req.params.username;

  if (friendUsername === user.username) {
    return res.status(401).json({
      message: "You cannot send a transaction to yourself",
    });
  }

  const friend = await UserDAL.findByUsername(friendUsername);
  if (!friend) {
    return res.status(402).json({ message: "Friend not found" });
  }

  const friendship = await FriendDAL.findByUsers(user._id, friend._id);
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

  // Generate a proper MongoDB ObjectId
  const { ObjectId } = await import('mongodb');
  const transactionId = new ObjectId();
  
  const transactionData = {
    _id: transactionId,
    amount: roundedAmount,
    description: description,
    sender: user._id,
    receiver: friend._id,
    status: amount < 0 ? "completed" : "pending",
    createdAt: new Date(),
  };
  
  console.log("addTransaction - Creating transaction:", {
    sender: user._id,
    receiver: friend._id,
    amount: roundedAmount,
    userUsername: user.username,
    friendUsername: friend.username
  });

  const isAdded = await TransactionDAL.create(transactionData);
  if (!isAdded) {
    return res.status(500).json({ message: "Transaction failed" });
  }

  const updatedFriendship = await FriendDAL.update(friendship._id, {
    lastTransactionTime: new Date(),
    isActive: true,
  });

  // Socket event will be handled by the socket handler in app.js
  // No need to emit here as it would cause duplicates

  return res.status(200).json({
    message: "Transaction added successfully",
    transaction: { ...isAdded, sender: isAdded.sender, receiver: isAdded.receiver },
  });
});

const showTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await UserDAL.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const friendUsername = req.params.username;
  if (friendUsername === user.username) {
    return res.status(401).json({
      message: "You cannot view transactions with yourself",
    });
  }

  const friend = await UserDAL.findByUsername(friendUsername);
  if (!friend) {
    return res.status(402).json({ message: "Friend not found" });
  }

  const friendship = await FriendDAL.findByUsers(user._id, friend._id);
  if (!friendship) {
    return res
      .status(403)
      .json({ message: "You are not friends with this user" });
  }

  const transactions = await TransactionDAL.findByUsers(user._id, friend._id);
  const allTransaction = transactions.map((transaction) => {
    console.log("showTransactions - Transaction data:", {
      _id: transaction._id,
      sender: transaction.sender,
      receiver: transaction.receiver,
      currentUserId: user._id,
      friendId: friend._id
    });
    
    return {
      _id: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt,
      sender: transaction.sender, // Keep the actual sender ID
      receiver: transaction.receiver, // Keep the actual receiver ID
    };
  });

  return res.status(200).json({ transactions: allTransaction, friend });
});

const acceptTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await UserDAL.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const transactionId = req.params.transactioinId;
  const transaction = await TransactionDAL.findById(transactionId);

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

  const updatedTransaction = await TransactionDAL.update(transactionId, {
    status: "completed",
  });

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io) {
    io.emit('acceptTransaction', transactionId);
  }

  return res.status(200).json({ message: "Transaction accepted successfully" });
});

const denyTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await UserDAL.findById(userId);

  const transactionId = req.params.transactioinId;

  const transaction = await TransactionDAL.findById(transactionId);

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

  const updatedTransaction = await TransactionDAL.update(transactionId, { status: "rejected" });

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io) {
    io.emit('rejectTransaction', transactionId);
  }

  return res.status(200).json({ message: "Transaction denied successfully" });
});

const cancelTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await UserDAL.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const transactionId = req.params.transactioinId;
  if (!transactionId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid transaction ID" });
  }

  const transaction = await TransactionDAL.findById(transactionId);
  if (!transaction) {
    return res.status(401).json({ message: "Transaction not found" });
  }

  if (transaction.sender.toString() !== user._id.toString()) {
    return res.status(402).json({ message: "You are not the sender" });
  }

  if (transaction.status !== "pending") {
    return res.status(403).json({ message: "Transaction already completed" });
  }

  const deleted = await TransactionDAL.delete(transactionId);
  if (!deleted) {
    return res.status(500).json({ message: "Transaction cancel failed" });
  }

  // Emit socket event for real-time updates
  const io = req.app.get('io');
  if (io) {
    io.emit('cancelTransaction', transactionId);
  }

  return res
    .status(200)
    .json({ message: "Transaction cancelled successfully" });
});

const splitExpenses = asyncHandler(async (req, res) => {
  const { final:splitValues, description } = req.body;
  const userId = req.user._id;
  const totalTransactions = [];

  try {
    for (const friendId of Object.keys(splitValues)) {
      const amount = splitValues[friendId];

      if(friendId == userId) {
        continue;
      }

      const isFriend = await FriendDAL.findByUsers(userId, friendId);

      if (!isFriend) {
        const friend = await UserDAL.findById(friendId);
        return res.status(403).json({
          message: `You are not friends with user: ${friend.username}`,
        });
      }

      // Generate a proper MongoDB ObjectId
      const { ObjectId } = await import('mongodb');
      const transactionId = new ObjectId();
      
      const transactionData = {
        _id: transactionId,
        amount,
        description,
        sender: userId,
        receiver: friendId,
        status: "pending",
        createdAt: new Date(),
      };

      const transaction = await TransactionDAL.create(transactionData);
      if (!transaction) {
        return res.status(500).json({ message: "Transaction creation failed" });
      }

      const updatedFriendship = await FriendDAL.update(isFriend._id, {
        lastTransactionTime: new Date(),
        isActive: true,
      });

      totalTransactions.push(transaction);
    }

    res.status(200).json({
      message: "All transactions added successfully",
      transactions: totalTransactions,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});


export {
  addTransaction,
  showTransactions,
  acceptTransaction,
  denyTransaction,
  cancelTransaction,
  splitExpenses,
};
