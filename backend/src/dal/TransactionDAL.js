import { TransactionRedis } from "../models/redis/Transaction.redis.js";
import { Transaction } from "../models/Transaction.model.js";

export class TransactionDAL {
  static async create(transactionData) {
    try {
      // Create in Redis first (primary)
      const redisTransaction = await TransactionRedis.create(transactionData);
      
      // Sync to MongoDB (backup)
      try {
        const mongoTransaction = new Transaction(transactionData);
        await mongoTransaction.save();
      } catch (mongoError) {
        console.error("MongoDB sync failed for transaction creation:", mongoError);
        // Continue with Redis data
      }
      
      return redisTransaction;
    } catch (error) {
      console.error("Redis transaction creation failed:", error);
      // Fallback to MongoDB
      const mongoTransaction = new Transaction(transactionData);
      return await mongoTransaction.save();
    }
  }

  static async findById(transactionId) {
    try {
      // Try Redis first
      const redisTransaction = await TransactionRedis.findById(transactionId);
      if (redisTransaction) return redisTransaction;
      
      // Fallback to MongoDB
      const mongoTransaction = await Transaction.findById(transactionId);
      if (mongoTransaction) {
        // Sync back to Redis
        await TransactionRedis.create(mongoTransaction.toObject());
        return mongoTransaction.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("Transaction findById error:", error);
      // Fallback to MongoDB
      const mongoTransaction = await Transaction.findById(transactionId);
      return mongoTransaction ? mongoTransaction.toObject() : null;
    }
  }

  static async findByUsers(senderId, receiverId) {
    try {
      // Try Redis first
      const redisTransactions = await TransactionRedis.findByUsers(senderId, receiverId);
      if (redisTransactions.length > 0) return redisTransactions;
      
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ createdAt: -1 });
      
      // Sync to Redis
      for (const mongoTransaction of mongoTransactions) {
        await TransactionRedis.create(mongoTransaction.toObject());
      }
      
      return mongoTransactions.map(t => t.toObject());
    } catch (error) {
      console.error("Transaction findByUsers error:", error);
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ createdAt: -1 });
      return mongoTransactions.map(t => t.toObject());
    }
  }

  static async findByUserId(userId) {
    try {
      // Try Redis first
      const redisTransactions = await TransactionRedis.findByUserId(userId);
      if (redisTransactions.length > 0) return redisTransactions;
      
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).sort({ createdAt: -1 });
      
      // Sync to Redis
      for (const mongoTransaction of mongoTransactions) {
        await TransactionRedis.create(mongoTransaction.toObject());
      }
      
      return mongoTransactions.map(t => t.toObject());
    } catch (error) {
      console.error("Transaction findByUserId error:", error);
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).sort({ createdAt: -1 });
      return mongoTransactions.map(t => t.toObject());
    }
  }

  static async findByStatus(status) {
    try {
      // Try Redis first
      const redisTransactions = await TransactionRedis.findByStatus(status);
      if (redisTransactions.length > 0) return redisTransactions;
      
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({ status }).sort({ createdAt: -1 });
      
      // Sync to Redis
      for (const mongoTransaction of mongoTransactions) {
        await TransactionRedis.create(mongoTransaction.toObject());
      }
      
      return mongoTransactions.map(t => t.toObject());
    } catch (error) {
      console.error("Transaction findByStatus error:", error);
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({ status }).sort({ createdAt: -1 });
      return mongoTransactions.map(t => t.toObject());
    }
  }

  static async update(transactionId, updateData) {
    try {
      // Update in Redis first
      const redisTransaction = await TransactionRedis.update(transactionId, updateData);
      if (redisTransaction) {
        // Sync to MongoDB
        try {
          await Transaction.findByIdAndUpdate(transactionId, updateData);
        } catch (mongoError) {
          console.error("MongoDB sync failed for transaction update:", mongoError);
        }
        return redisTransaction;
      }
      
      // Fallback to MongoDB
      const mongoTransaction = await Transaction.findByIdAndUpdate(transactionId, updateData, { new: true });
      if (mongoTransaction) {
        // Sync back to Redis
        await TransactionRedis.create(mongoTransaction.toObject());
        return mongoTransaction.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("Transaction update error:", error);
      // Fallback to MongoDB
      const mongoTransaction = await Transaction.findByIdAndUpdate(transactionId, updateData, { new: true });
      return mongoTransaction ? mongoTransaction.toObject() : null;
    }
  }

  static async delete(transactionId) {
    try {
      // Delete from Redis first
      const redisDeleted = await TransactionRedis.delete(transactionId);
      if (redisDeleted) {
        // Sync to MongoDB
        try {
          await Transaction.findByIdAndDelete(transactionId);
        } catch (mongoError) {
          console.error("MongoDB sync failed for transaction deletion:", mongoError);
        }
        return true;
      }
      
      // Fallback to MongoDB
      const mongoDeleted = await Transaction.findByIdAndDelete(transactionId);
      return !!mongoDeleted;
    } catch (error) {
      console.error("Transaction delete error:", error);
      // Fallback to MongoDB
      const mongoDeleted = await Transaction.findByIdAndDelete(transactionId);
      return !!mongoDeleted;
    }
  }

  static async getPendingTransactions(userId) {
    try {
      // Try Redis first
      return await TransactionRedis.getPendingTransactions(userId);
    } catch (error) {
      console.error("Transaction getPendingTransactions error:", error);
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: "pending",
      }).sort({ createdAt: -1 });
      return mongoTransactions.map(t => t.toObject());
    }
  }

  static async getCompletedTransactions(userId) {
    try {
      // Try Redis first
      return await TransactionRedis.getCompletedTransactions(userId);
    } catch (error) {
      console.error("Transaction getCompletedTransactions error:", error);
      // Fallback to MongoDB
      const mongoTransactions = await Transaction.find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: "completed",
      }).sort({ createdAt: -1 });
      return mongoTransactions.map(t => t.toObject());
    }
  }
}
