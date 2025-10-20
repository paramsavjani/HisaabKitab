import { 
  redisGet, redisSet, redisDel, redisExists, redisSAdd, redisSRem, redisSMembers, redisKeys,
  buildTransactionKey, buildUserTransactionsKey
} from "../../utils/redis.js";

export class TransactionRedis {
  static async create(transactionData) {
    const transactionId = transactionData._id || transactionData.id;
    const transactionKey = buildTransactionKey(transactionId);
    
    // Store transaction data as string
    await redisSet(transactionKey, transactionData);
    
    // Add to user transactions sets
    const senderKey = buildUserTransactionsKey(String(transactionData.sender));
    const receiverKey = buildUserTransactionsKey(String(transactionData.receiver));
    
    await redisSAdd(senderKey, String(transactionId));
    await redisSAdd(receiverKey, String(transactionId));
    
    return transactionData;
  }

  static async findById(transactionId) {
    const transactionKey = buildTransactionKey(transactionId);
    return await redisGet(transactionKey);
  }

  static async findByUsers(senderId, receiverId) {
    const senderTransactions = await redisSMembers(buildUserTransactionsKey(senderId));
    const receiverTransactions = await redisSMembers(buildUserTransactionsKey(receiverId));
    
    // Find common transactions between sender and receiver
    const commonTransactionIds = senderTransactions.filter(id => receiverTransactions.includes(id));
    const transactions = [];
    
    for (const transactionId of commonTransactionIds) {
      const transaction = await this.findById(transactionId);
      if (transaction) transactions.push(transaction);
    }
    
    return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findByUserId(userId) {
    const userKey = buildUserTransactionsKey(String(userId));
    const transactionIds = await redisSMembers(userKey);
    const transactions = [];
    
    for (const transactionId of transactionIds) {
      const transaction = await this.findById(transactionId);
      if (transaction) {
        transactions.push(transaction);
      }
    }
    
    return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findByStatus(status) {
    // This is a simplified implementation - in production, you might want to use Redis Search
    const pattern = `transaction:*`;
    const keys = await redisKeys(pattern);
    const transactions = [];
    
    for (const key of keys) {
      const transaction = await redisGet(key);
      if (transaction && transaction.status === status) {
        transactions.push(transaction);
      }
    }
    
    return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async update(transactionId, updateData) {
    const transaction = await this.findById(transactionId);
    if (!transaction) return null;
    
    const updatedTransaction = { ...transaction, ...updateData };
    const transactionKey = buildTransactionKey(transactionId);
    
    await redisSet(transactionKey, updatedTransaction);
    return updatedTransaction;
  }

  static async delete(transactionId) {
    const transaction = await this.findById(transactionId);
    if (!transaction) return false;
    
    const transactionKey = buildTransactionKey(transactionId);
    
    // Remove from user transactions sets
    await redisSRem(buildUserTransactionsKey(String(transaction.sender)), String(transactionId));
    await redisSRem(buildUserTransactionsKey(String(transaction.receiver)), String(transactionId));
    
    // Delete transaction data
    await redisDel(transactionKey);
    
    return true;
  }

  static async exists(transactionId) {
    const transactionKey = buildTransactionKey(transactionId);
    return await redisExists(transactionKey);
  }

  static async getTransactionsCount(userId) {
    const transactionIds = await redisSMembers(buildUserTransactionsKey(String(userId)));
    return transactionIds.length;
  }

  static async getPendingTransactions(userId) {
    const transactions = await this.findByUserId(userId);
    return transactions.filter(t => t.status === "pending");
  }

  static async getCompletedTransactions(userId) {
    const transactions = await this.findByUserId(userId);
    return transactions.filter(t => t.status === "completed");
  }
}
