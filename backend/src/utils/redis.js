import { createClient } from "redis";

let client;

export const getRedisClient = () => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
  }
  return client;
};

export const connectRedis = async () => {
  const redis = getRedisClient();
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
};

export const disconnectRedis = async () => {
  if (client && client.isOpen) {
    await client.quit();
  }
};

// Generic Redis operations
export const redisGet = async (key) => {
  const redis = await connectRedis();
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const redisSet = async (key, value, ttlSeconds = null) => {
  const redis = await connectRedis();
  const toStore = typeof value === "string" ? value : JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    await redis.set(key, toStore, { EX: ttlSeconds });
  } else {
    await redis.set(key, toStore);
  }
};

export const redisDel = async (key) => {
  const redis = await connectRedis();
  await redis.del(key);
};

export const redisExists = async (key) => {
  const redis = await connectRedis();
  return await redis.exists(key);
};

export const redisKeys = async (pattern) => {
  const redis = await connectRedis();
  return await redis.keys(pattern);
};

export const redisHGet = async (key, field) => {
  const redis = await connectRedis();
  const value = await redis.hGet(key, field);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const redisHSet = async (key, field, value) => {
  const redis = await connectRedis();
  const toStore = typeof value === "string" ? value : JSON.stringify(value);
  await redis.hSet(key, field, toStore);
};

export const redisHGetAll = async (key) => {
  const redis = await connectRedis();
  const hash = await redis.hGetAll(key);
  const result = {};
  for (const [field, value] of Object.entries(hash)) {
    try {
      result[field] = JSON.parse(value);
    } catch {
      result[field] = value;
    }
  }
  return result;
};

export const redisHDel = async (key, field) => {
  const redis = await connectRedis();
  await redis.hDel(key, field);
};

export const redisSAdd = async (key, ...members) => {
  const redis = await connectRedis();
  if (members.length === 0) {
    return 0; // No members to add
  }
  try {
    // Ensure all members are strings
    const stringMembers = members.map(member => String(member));
    return await redis.sAdd(key, ...stringMembers);
  } catch (error) {
    if (error.message.includes('WRONGTYPE')) {
      // Key exists but is wrong type, delete it and recreate
      await redis.del(key);
      const stringMembers = members.map(member => String(member));
      return await redis.sAdd(key, ...stringMembers);
    }
    throw error;
  }
};

export const redisSRem = async (key, ...members) => {
  const redis = await connectRedis();
  try {
    // Ensure all members are strings
    const stringMembers = members.map(member => String(member));
    return await redis.sRem(key, ...stringMembers);
  } catch (error) {
    if (error.message.includes('WRONGTYPE') || error.message.includes('no such key')) {
      return 0; // Return 0 if key doesn't exist or wrong type
    }
    throw error;
  }
};

export const redisSMembers = async (key) => {
  const redis = await connectRedis();
  try {
    return await redis.sMembers(key);
  } catch (error) {
    if (error.message.includes('WRONGTYPE') || error.message.includes('no such key')) {
      return []; // Return empty array if key doesn't exist or wrong type
    }
    throw error;
  }
};

export const redisSIsMember = async (key, member) => {
  const redis = await connectRedis();
  try {
    // Ensure member is string
    return await redis.sIsMember(key, String(member));
  } catch (error) {
    if (error.message.includes('WRONGTYPE') || error.message.includes('no such key')) {
      return false; // Return false if key doesn't exist or wrong type
    }
    throw error;
  }
};

export const redisLPush = async (key, ...elements) => {
  const redis = await connectRedis();
  return await redis.lPush(key, ...elements);
};

export const redisRPush = async (key, ...elements) => {
  const redis = await connectRedis();
  return await redis.rPush(key, ...elements);
};

export const redisLPop = async (key) => {
  const redis = await connectRedis();
  return await redis.lPop(key);
};

export const redisRPop = async (key) => {
  const redis = await connectRedis();
  return await redis.rPop(key);
};

export const redisLRange = async (key, start, stop) => {
  const redis = await connectRedis();
  return await redis.lRange(key, start, stop);
};

export const redisLLen = async (key) => {
  const redis = await connectRedis();
  return await redis.lLen(key);
};

// Key builders
export const buildKey = (prefix, ...parts) => {
  return `${prefix}:${parts.filter(Boolean).join(":")}`;
};

export const buildUserKey = (userId) => buildKey("user", userId);
export const buildFriendKey = (userId, friendId) => buildKey("friend", userId, friendId);
export const buildTransactionKey = (transactionId) => buildKey("transaction", transactionId);
export const buildRequestKey = (requestId) => buildKey("request", requestId);

// Index keys
export const buildUserByUsernameKey = (username) => buildKey("user:username", username);
export const buildUserFriendsKey = (userId) => buildKey("user:friends", userId);
export const buildUserTransactionsKey = (userId) => buildKey("user:transactions", userId);
export const buildUserRequestsKey = (userId) => buildKey("user:requests", userId);
export const buildUserSentRequestsKey = (userId) => buildKey("user:sent_requests", userId);
export const buildUserReceivedRequestsKey = (userId) => buildKey("user:received_requests", userId);

// Clear all Redis data
export const clearAllRedisData = async () => {
  const redis = await connectRedis();
  const keys = await redis.keys("*");
  if (keys.length > 0) {
    await redis.del(keys);
  }
  console.log("All Redis data cleared");
};
