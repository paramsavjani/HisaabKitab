import { FriendRedis } from "../models/redis/Friend.redis.js";
import { Friend } from "../models/Friend.model.js";

export class FriendDAL {
  static async create(friendshipData) {
    try {
      // Create in Redis first (primary)
      const redisFriendship = await FriendRedis.create(friendshipData);
      
      // Sync to MongoDB (backup)
      try {
        const mongoFriendship = new Friend(friendshipData);
        await mongoFriendship.save();
      } catch (mongoError) {
        console.error("MongoDB sync failed for friendship creation:", mongoError);
        // Continue with Redis data
      }
      
      return redisFriendship;
    } catch (error) {
      console.error("Redis friendship creation failed:", error);
      // Fallback to MongoDB
      const mongoFriendship = new Friend(friendshipData);
      return await mongoFriendship.save();
    }
  }

  static async findById(friendshipId) {
    try {
      // Try Redis first
      const redisFriendship = await FriendRedis.findById(friendshipId);
      if (redisFriendship) return redisFriendship;
      
      // Fallback to MongoDB
      const mongoFriendship = await Friend.findById(friendshipId);
      if (mongoFriendship) {
        // Sync back to Redis
        await FriendRedis.create(mongoFriendship.toObject());
        return mongoFriendship.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("Friendship findById error:", error);
      // Fallback to MongoDB
      const mongoFriendship = await Friend.findById(friendshipId);
      return mongoFriendship ? mongoFriendship.toObject() : null;
    }
  }

  static async findByUsers(userId, friendId) {
    try {
      // Try Redis first
      const redisFriendship = await FriendRedis.findByUsers(userId, friendId);
      if (redisFriendship) return redisFriendship;
      
      // Fallback to MongoDB
      const mongoFriendship = await Friend.findOne({
        $or: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      });
      if (mongoFriendship) {
        // Sync back to Redis
        await FriendRedis.create(mongoFriendship.toObject());
        return mongoFriendship.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("Friendship findByUsers error:", error);
      // Fallback to MongoDB
      const mongoFriendship = await Friend.findOne({
        $or: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      });
      return mongoFriendship ? mongoFriendship.toObject() : null;
    }
  }

  static async findByUserId(userId) {
    try {
      // Try Redis first
      const redisFriendships = await FriendRedis.findByUserId(userId);
      if (redisFriendships.length > 0) return redisFriendships;
      
      // Fallback to MongoDB
      const mongoFriendships = await Friend.find({
        $or: [{ userId }, { friendId: userId }],
      });
      
      // Sync to Redis
      for (const mongoFriendship of mongoFriendships) {
        await FriendRedis.create(mongoFriendship.toObject());
      }
      
      return mongoFriendships.map(f => f.toObject());
    } catch (error) {
      console.error("Friendship findByUserId error:", error);
      // Fallback to MongoDB
      const mongoFriendships = await Friend.find({
        $or: [{ userId }, { friendId: userId }],
      });
      return mongoFriendships.map(f => f.toObject());
    }
  }

  static async update(friendshipId, updateData) {
    try {
      // Update in Redis first
      const redisFriendship = await FriendRedis.update(friendshipId, updateData);
      if (redisFriendship) {
        // Sync to MongoDB
        try {
          await Friend.findByIdAndUpdate(friendshipId, updateData);
        } catch (mongoError) {
          console.error("MongoDB sync failed for friendship update:", mongoError);
        }
        return redisFriendship;
      }
      
      // Fallback to MongoDB
      const mongoFriendship = await Friend.findByIdAndUpdate(friendshipId, updateData, { new: true });
      if (mongoFriendship) {
        // Sync back to Redis
        await FriendRedis.create(mongoFriendship.toObject());
        return mongoFriendship.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("Friendship update error:", error);
      // Fallback to MongoDB
      const mongoFriendship = await Friend.findByIdAndUpdate(friendshipId, updateData, { new: true });
      return mongoFriendship ? mongoFriendship.toObject() : null;
    }
  }

  static async delete(friendshipId) {
    try {
      // Delete from Redis first
      const redisDeleted = await FriendRedis.delete(friendshipId);
      if (redisDeleted) {
        // Sync to MongoDB
        try {
          await Friend.findByIdAndDelete(friendshipId);
        } catch (mongoError) {
          console.error("MongoDB sync failed for friendship deletion:", mongoError);
        }
        return true;
      }
      
      // Fallback to MongoDB
      const mongoDeleted = await Friend.findByIdAndDelete(friendshipId);
      return !!mongoDeleted;
    } catch (error) {
      console.error("Friendship delete error:", error);
      // Fallback to MongoDB
      const mongoDeleted = await Friend.findByIdAndDelete(friendshipId);
      return !!mongoDeleted;
    }
  }

  static async deleteByUsers(userId, friendId) {
    try {
      // Delete from Redis first
      const redisDeleted = await FriendRedis.deleteByUsers(userId, friendId);
      if (redisDeleted) {
        // Sync to MongoDB
        try {
          await Friend.findOneAndDelete({
            $or: [
              { userId, friendId },
              { userId: friendId, friendId: userId },
            ],
          });
        } catch (mongoError) {
          console.error("MongoDB sync failed for friendship deletion:", mongoError);
        }
        return true;
      }
      
      // Fallback to MongoDB
      const mongoDeleted = await Friend.findOneAndDelete({
        $or: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      });
      return !!mongoDeleted;
    } catch (error) {
      console.error("Friendship deleteByUsers error:", error);
      // Fallback to MongoDB
      const mongoDeleted = await Friend.findOneAndDelete({
        $or: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      });
      return !!mongoDeleted;
    }
  }

  static async isFriends(userId, friendId) {
    try {
      // Try Redis first
      return await FriendRedis.isFriends(userId, friendId);
    } catch (error) {
      console.error("Friendship isFriends error:", error);
      // Fallback to MongoDB
      const mongoFriendship = await Friend.findOne({
        $or: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      });
      return !!mongoFriendship;
    }
  }
}
