import { 
  redisGet, redisSet, redisDel, redisExists, redisSAdd, redisSRem, redisSMembers, redisSIsMember, redisKeys,
  buildFriendKey, buildUserFriendsKey
} from "../../utils/redis.js";

export class FriendRedis {
  static async create(friendshipData) {
    const { userId, friendId } = friendshipData;
    const friendKey = buildFriendKey(userId, friendId);
    const reverseFriendKey = buildFriendKey(friendId, userId);
    
    // Store friendship data
    await redisSet(friendKey, friendshipData);
    await redisSet(reverseFriendKey, { ...friendshipData, userId: friendId, friendId: userId });
    
    // Add to user friends sets
    await redisSAdd(buildUserFriendsKey(String(userId)), String(friendId));
    await redisSAdd(buildUserFriendsKey(String(friendId)), String(userId));
    
    return friendshipData;
  }

  static async findById(friendshipId) {
    // We need to search for the friendship by ID
    const pattern = `friend:*`;
    const keys = await redisKeys(pattern);
    
    for (const key of keys) {
      const friendship = await redisGet(key);
      if (friendship && friendship._id === friendshipId) {
        return friendship;
      }
    }
    return null;
  }

  static async findByUsers(userId, friendId) {
    const friendKey = buildFriendKey(userId, friendId);
    return await redisGet(friendKey);
  }

  static async findByUserId(userId) {
    const friendsIds = await redisSMembers(buildUserFriendsKey(String(userId)));
    const friendships = [];
    
    for (const friendId of friendsIds) {
      const friendship = await this.findByUsers(userId, friendId);
      if (friendship) friendships.push(friendship);
    }
    
    return friendships;
  }

  static async update(friendshipId, updateData) {
    const friendship = await this.findById(friendshipId);
    if (!friendship) return null;
    
    const updatedFriendship = { ...friendship, ...updateData };
    const friendKey = buildFriendKey(friendship.userId, friendship.friendId);
    const reverseFriendKey = buildFriendKey(friendship.friendId, friendship.userId);
    
    await redisSet(friendKey, updatedFriendship);
    await redisSet(reverseFriendKey, { ...updatedFriendship, userId: friendship.friendId, friendId: friendship.userId });
    
    return updatedFriendship;
  }

  static async delete(friendshipId) {
    const friendship = await this.findById(friendshipId);
    if (!friendship) return false;
    
    const { userId, friendId } = friendship;
    const friendKey = buildFriendKey(userId, friendId);
    const reverseFriendKey = buildFriendKey(friendId, userId);
    
    // Remove from user friends sets
    await redisSRem(buildUserFriendsKey(String(userId)), String(friendId));
    await redisSRem(buildUserFriendsKey(String(friendId)), String(userId));
    
    // Delete friendship data
    await redisDel(friendKey);
    await redisDel(reverseFriendKey);
    
    return true;
  }

  static async deleteByUsers(userId, friendId) {
    const friendship = await this.findByUsers(userId, friendId);
    if (!friendship) return false;
    
    return await this.delete(friendship._id);
  }

  static async isFriends(userId, friendId) {
    return await redisSIsMember(buildUserFriendsKey(String(userId)), String(friendId));
  }

  static async getFriendsCount(userId) {
    const friendsIds = await redisSMembers(buildUserFriendsKey(String(userId)));
    return friendsIds.length;
  }

  static async exists(friendshipId) {
    return await this.findById(friendshipId) !== null;
  }
}
