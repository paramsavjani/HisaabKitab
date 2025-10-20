import { RequestRedis } from "../models/redis/Request.redis.js";
import { Request } from "../models/Request.model.js";

export class RequestDAL {
  static async create(requestData) {
    try {
      // Create in Redis first (primary)
      const redisRequest = await RequestRedis.create(requestData);
      
      // Sync to MongoDB (backup)
      try {
        const mongoRequest = new Request(requestData);
        await mongoRequest.save();
      } catch (mongoError) {
        console.error("MongoDB sync failed for request creation:", mongoError);
        // Continue with Redis data
      }
      
      return redisRequest;
    } catch (error) {
      console.error("Redis request creation failed:", error);
      // Fallback to MongoDB
      const mongoRequest = new Request(requestData);
      return await mongoRequest.save();
    }
  }

  static async findById(requestId) {
    try {
      // Try Redis first
      const redisRequest = await RequestRedis.findById(requestId);
      if (redisRequest) return redisRequest;
      
      // Fallback to MongoDB
      const mongoRequest = await Request.findById(requestId);
      if (mongoRequest) {
        // Sync back to Redis
        await RequestRedis.create(mongoRequest.toObject());
        return mongoRequest.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("Request findById error:", error);
      // Fallback to MongoDB
      const mongoRequest = await Request.findById(requestId);
      return mongoRequest ? mongoRequest.toObject() : null;
    }
  }

  static async findBySender(senderId) {
    try {
      // Try Redis first
      const redisRequests = await RequestRedis.findBySender(senderId);
      if (redisRequests.length > 0) return redisRequests;
      
      // Fallback to MongoDB
      const mongoRequests = await Request.find({ sender: senderId }).sort({ createdAt: -1 });
      
      // Sync to Redis
      for (const mongoRequest of mongoRequests) {
        await RequestRedis.create(mongoRequest.toObject());
      }
      
      return mongoRequests.map(r => r.toObject());
    } catch (error) {
      console.error("Request findBySender error:", error);
      // Fallback to MongoDB
      const mongoRequests = await Request.find({ sender: senderId }).sort({ createdAt: -1 });
      return mongoRequests.map(r => r.toObject());
    }
  }

  static async findByReceiver(receiverId) {
    try {
      // Try Redis first
      const redisRequests = await RequestRedis.findByReceiver(receiverId);
      if (redisRequests.length > 0) return redisRequests;
      
      // Fallback to MongoDB
      const mongoRequests = await Request.find({ receiver: receiverId }).sort({ createdAt: -1 });
      
      // Sync to Redis
      for (const mongoRequest of mongoRequests) {
        await RequestRedis.create(mongoRequest.toObject());
      }
      
      return mongoRequests.map(r => r.toObject());
    } catch (error) {
      console.error("Request findByReceiver error:", error);
      // Fallback to MongoDB
      const mongoRequests = await Request.find({ receiver: receiverId }).sort({ createdAt: -1 });
      return mongoRequests.map(r => r.toObject());
    }
  }

  static async findByUsers(senderId, receiverId) {
    try {
      // Try Redis first
      const redisRequests = await RequestRedis.findByUsers(senderId, receiverId);
      if (redisRequests.length > 0) return redisRequests;
      
      // Fallback to MongoDB
      const mongoRequests = await Request.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ createdAt: -1 });
      
      // Sync to Redis
      for (const mongoRequest of mongoRequests) {
        await RequestRedis.create(mongoRequest.toObject());
      }
      
      return mongoRequests.map(r => r.toObject());
    } catch (error) {
      console.error("Request findByUsers error:", error);
      // Fallback to MongoDB
      const mongoRequests = await Request.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).sort({ createdAt: -1 });
      return mongoRequests.map(r => r.toObject());
    }
  }

  static async findByStatus(status) {
    try {
      // Try Redis first
      const redisRequests = await RequestRedis.findByStatus(status);
      if (redisRequests.length > 0) return redisRequests;
      
      // Fallback to MongoDB
      const mongoRequests = await Request.find({ status }).sort({ createdAt: -1 });
      
      // Sync to Redis
      for (const mongoRequest of mongoRequests) {
        await RequestRedis.create(mongoRequest.toObject());
      }
      
      return mongoRequests.map(r => r.toObject());
    } catch (error) {
      console.error("Request findByStatus error:", error);
      // Fallback to MongoDB
      const mongoRequests = await Request.find({ status }).sort({ createdAt: -1 });
      return mongoRequests.map(r => r.toObject());
    }
  }

  static async findPendingByReceiver(receiverId) {
    try {
      // Try Redis first
      return await RequestRedis.findPendingByReceiver(receiverId);
    } catch (error) {
      console.error("Request findPendingByReceiver error:", error);
      // Fallback to MongoDB
      const mongoRequests = await Request.find({
        receiver: receiverId,
        status: "pending",
      }).sort({ createdAt: -1 });
      return mongoRequests.map(r => r.toObject());
    }
  }

  static async findPendingBySender(senderId) {
    try {
      // Try Redis first
      return await RequestRedis.findPendingBySender(senderId);
    } catch (error) {
      console.error("Request findPendingBySender error:", error);
      // Fallback to MongoDB
      const mongoRequests = await Request.find({
        sender: senderId,
        status: "pending",
      }).sort({ createdAt: -1 });
      return mongoRequests.map(r => r.toObject());
    }
  }

  static async update(requestId, updateData) {
    try {
      // Update in Redis first
      const redisRequest = await RequestRedis.update(requestId, updateData);
      if (redisRequest) {
        // Sync to MongoDB
        try {
          await Request.findByIdAndUpdate(requestId, updateData);
        } catch (mongoError) {
          console.error("MongoDB sync failed for request update:", mongoError);
        }
        return redisRequest;
      }
      
      // Fallback to MongoDB
      const mongoRequest = await Request.findByIdAndUpdate(requestId, updateData, { new: true });
      if (mongoRequest) {
        // Sync back to Redis
        await RequestRedis.create(mongoRequest.toObject());
        return mongoRequest.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("Request update error:", error);
      // Fallback to MongoDB
      const mongoRequest = await Request.findByIdAndUpdate(requestId, updateData, { new: true });
      return mongoRequest ? mongoRequest.toObject() : null;
    }
  }

  static async delete(requestId) {
    try {
      // Delete from Redis first
      const redisDeleted = await RequestRedis.delete(requestId);
      if (redisDeleted) {
        // Sync to MongoDB
        try {
          await Request.findByIdAndDelete(requestId);
        } catch (mongoError) {
          console.error("MongoDB sync failed for request deletion:", mongoError);
        }
        return true;
      }
      
      // Fallback to MongoDB
      const mongoDeleted = await Request.findByIdAndDelete(requestId);
      return !!mongoDeleted;
    } catch (error) {
      console.error("Request delete error:", error);
      // Fallback to MongoDB
      const mongoDeleted = await Request.findByIdAndDelete(requestId);
      return !!mongoDeleted;
    }
  }

  static async hasPendingRequest(senderId, receiverId) {
    try {
      // Try Redis first
      return await RequestRedis.hasPendingRequest(senderId, receiverId);
    } catch (error) {
      console.error("Request hasPendingRequest error:", error);
      // Fallback to MongoDB
      const mongoRequest = await Request.findOne({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
      });
      return !!mongoRequest;
    }
  }

  static async hasReceivedPendingRequest(senderId, receiverId) {
    try {
      // Try Redis first
      return await RequestRedis.hasReceivedPendingRequest(senderId, receiverId);
    } catch (error) {
      console.error("Request hasReceivedPendingRequest error:", error);
      // Fallback to MongoDB
      const mongoRequest = await Request.findOne({
        sender: receiverId,
        receiver: senderId,
        status: "pending",
      });
      return !!mongoRequest;
    }
  }
}
