import { UserRedis } from "../models/redis/User.redis.js";
import { User } from "../models/User.model.js";

export class UserDAL {
  static async create(userData) {
    try {
      // Create in Redis first (primary)
      const redisUser = await UserRedis.create(userData);
      
      // Sync to MongoDB (backup)
      try {
        const mongoUser = new User(userData);
        await mongoUser.save();
      } catch (mongoError) {
        console.error("MongoDB sync failed for user creation:", mongoError);
        // Continue with Redis data
      }
      
      return redisUser;
    } catch (error) {
      console.error("Redis user creation failed:", error);
      // Fallback to MongoDB
      const mongoUser = new User(userData);
      return await mongoUser.save();
    }
  }

  static async findById(userId) {
    try {
      // Try Redis first
      const redisUser = await UserRedis.findById(userId);
      if (redisUser) return redisUser;
      
      // Fallback to MongoDB
      const mongoUser = await User.findById(userId);
      if (mongoUser) {
        // Sync back to Redis
        await UserRedis.create(mongoUser.toObject());
        return mongoUser.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("User findById error:", error);
      // Fallback to MongoDB
      const mongoUser = await User.findById(userId);
      return mongoUser ? mongoUser.toObject() : null;
    }
  }

  static async findByUsername(username) {
    try {
      // Try Redis first
      const redisUser = await UserRedis.findByUsername(username);
      if (redisUser) return redisUser;
      
      // Fallback to MongoDB
      const mongoUser = await User.findOne({ username });
      if (mongoUser) {
        // Sync back to Redis
        await UserRedis.create(mongoUser.toObject());
        return mongoUser.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("User findByUsername error:", error);
      // Fallback to MongoDB
      const mongoUser = await User.findOne({ username });
      return mongoUser ? mongoUser.toObject() : null;
    }
  }

  static async findByIds(userIds) {
    try {
      // Try Redis first
      const redisUsers = await UserRedis.findByIds(userIds);
      if (redisUsers.length === userIds.length) return redisUsers;
      
      // Fallback to MongoDB for missing users
      const mongoUsers = await User.find({ _id: { $in: userIds } });
      const allUsers = [...redisUsers];
      
      for (const mongoUser of mongoUsers) {
        const userObj = mongoUser.toObject();
        if (!redisUsers.find(u => u._id.toString() === userObj._id.toString())) {
          allUsers.push(userObj);
          // Sync to Redis
          await UserRedis.create(userObj);
        }
      }
      
      return allUsers;
    } catch (error) {
      console.error("User findByIds error:", error);
      // Fallback to MongoDB
      const mongoUsers = await User.find({ _id: { $in: userIds } });
      return mongoUsers.map(u => u.toObject());
    }
  }

  static async update(userId, updateData) {
    try {
      // Update in Redis first
      const redisUser = await UserRedis.update(userId, updateData);
      if (redisUser) {
        // Sync to MongoDB
        try {
          await User.findByIdAndUpdate(userId, updateData);
        } catch (mongoError) {
          console.error("MongoDB sync failed for user update:", mongoError);
        }
        return redisUser;
      }
      
      // Fallback to MongoDB
      const mongoUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (mongoUser) {
        // Sync back to Redis
        await UserRedis.create(mongoUser.toObject());
        return mongoUser.toObject();
      }
      
      return null;
    } catch (error) {
      console.error("User update error:", error);
      // Fallback to MongoDB
      const mongoUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      return mongoUser ? mongoUser.toObject() : null;
    }
  }

  static async delete(userId) {
    try {
      // Delete from Redis first
      const redisDeleted = await UserRedis.delete(userId);
      if (redisDeleted) {
        // Sync to MongoDB
        try {
          await User.findByIdAndDelete(userId);
        } catch (mongoError) {
          console.error("MongoDB sync failed for user deletion:", mongoError);
        }
        return true;
      }
      
      // Fallback to MongoDB
      const mongoDeleted = await User.findByIdAndDelete(userId);
      return !!mongoDeleted;
    } catch (error) {
      console.error("User delete error:", error);
      // Fallback to MongoDB
      const mongoDeleted = await User.findByIdAndDelete(userId);
      return !!mongoDeleted;
    }
  }

  static async search(query) {
    try {
      // Try Redis first
      const redisUsers = await UserRedis.search(query);
      if (redisUsers.length > 0) return redisUsers;
      
      // Fallback to MongoDB
      const mongoUsers = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      });
      
      // Sync to Redis
      for (const mongoUser of mongoUsers) {
        await UserRedis.create(mongoUser.toObject());
      }
      
      return mongoUsers.map(u => u.toObject());
    } catch (error) {
      console.error("User search error:", error);
      // Fallback to MongoDB
      const mongoUsers = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      });
      return mongoUsers.map(u => u.toObject());
    }
  }
}
