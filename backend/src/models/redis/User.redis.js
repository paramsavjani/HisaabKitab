import { 
  redisGet, redisSet, redisDel, redisExists, redisHGet, redisHSet, redisHGetAll, redisHDel,
  buildUserKey, buildUserByUsernameKey, buildUserFriendsKey, buildUserTransactionsKey,
  buildUserRequestsKey, buildUserSentRequestsKey, buildUserReceivedRequestsKey
} from "../../utils/redis.js";

export class UserRedis {
  static async create(userData) {
    const userId = userData._id || userData.id;
    const userKey = buildUserKey(userId);
    const usernameKey = buildUserByUsernameKey(userData.username);
    
    // Store user data as string
    await redisSet(userKey, userData);
    
    // Create username index as string
    await redisSet(usernameKey, userId);
    
    // User collections will be created when first item is added
    // No need to initialize empty sets
    
    return userData;
  }

  static async findById(userId) {
    const userKey = buildUserKey(userId);
    return await redisGet(userKey);
  }

  static async findByUsername(username) {
    const usernameKey = buildUserByUsernameKey(username);
    const userId = await redisGet(usernameKey);
    if (!userId) return null;
    return await this.findById(userId);
  }

  static async findByIds(userIds) {
    const users = [];
    for (const userId of userIds) {
      const user = await this.findById(userId);
      if (user) users.push(user);
    }
    return users;
  }

  static async update(userId, updateData) {
    const userKey = buildUserKey(userId);
    const existingUser = await redisGet(userKey);
    if (!existingUser) return null;
    
    const updatedUser = { ...existingUser, ...updateData };
    await redisSet(userKey, updatedUser);
    return updatedUser;
  }

  static async delete(userId) {
    const user = await this.findById(userId);
    if (!user) return false;
    
    const userKey = buildUserKey(userId);
    const usernameKey = buildUserByUsernameKey(user.username);
    
    // Delete user data and indexes
    await redisDel(userKey);
    await redisDel(usernameKey);
    await redisDel(buildUserFriendsKey(userId));
    await redisDel(buildUserTransactionsKey(userId));
    await redisDel(buildUserRequestsKey(userId));
    await redisDel(buildUserSentRequestsKey(userId));
    await redisDel(buildUserReceivedRequestsKey(userId));
    
    return true;
  }

  static async search(query) {
    // This is a simplified search - in production, you might want to use Redis Search
    const pattern = `user:*`;
    const keys = await redisKeys(pattern);
    const users = [];
    
    for (const key of keys) {
      if (key.includes('username')) continue; // Skip index keys
      const user = await redisGet(key);
      if (user && (
        user.username?.toLowerCase().includes(query.toLowerCase()) ||
        user.name?.toLowerCase().includes(query.toLowerCase())
      )) {
        users.push(user);
      }
    }
    
    return users;
  }

  static async exists(userId) {
    const userKey = buildUserKey(userId);
    return await redisExists(userKey);
  }
}
