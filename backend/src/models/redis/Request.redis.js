import { 
  redisGet, redisSet, redisDel, redisExists, redisSAdd, redisSRem, redisSMembers, redisKeys,
  buildRequestKey, buildUserSentRequestsKey, buildUserReceivedRequestsKey
} from "../../utils/redis.js";

export class RequestRedis {
  static async create(requestData) {
    const requestId = requestData._id || requestData.id;
    const requestKey = buildRequestKey(requestId);
    
    // Store request data
    await redisSet(requestKey, requestData);
    
    // Add to user requests sets
    await redisSAdd(buildUserSentRequestsKey(String(requestData.sender)), String(requestId));
    await redisSAdd(buildUserReceivedRequestsKey(String(requestData.receiver)), String(requestId));
    
    return requestData;
  }

  static async findById(requestId) {
    const requestKey = buildRequestKey(requestId);
    return await redisGet(requestKey);
  }

  static async findBySender(senderId) {
    const requestIds = await redisSMembers(buildUserSentRequestsKey(String(senderId)));
    const requests = [];
    
    for (const requestId of requestIds) {
      const request = await this.findById(requestId);
      if (request) requests.push(request);
    }
    
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findByReceiver(receiverId) {
    const requestIds = await redisSMembers(buildUserReceivedRequestsKey(String(receiverId)));
    const requests = [];
    
    for (const requestId of requestIds) {
      const request = await this.findById(requestId);
      if (request) requests.push(request);
    }
    
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findByUsers(senderId, receiverId) {
    const senderRequests = await redisSMembers(buildUserSentRequestsKey(String(senderId)));
    const receiverRequests = await redisSMembers(buildUserReceivedRequestsKey(String(receiverId)));
    
    // Find common requests between sender and receiver
    const commonRequestIds = senderRequests.filter(id => receiverRequests.includes(id));
    const requests = [];
    
    for (const requestId of commonRequestIds) {
      const request = await this.findById(requestId);
      if (request) requests.push(request);
    }
    
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findByStatus(status) {
    // This is a simplified implementation - in production, you might want to use Redis Search
    const pattern = `request:*`;
    const keys = await redisKeys(pattern);
    const requests = [];
    
    for (const key of keys) {
      const request = await redisGet(key);
      if (request && request.status === status) {
        requests.push(request);
      }
    }
    
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findPendingByReceiver(receiverId) {
    const requests = await this.findByReceiver(receiverId);
    return requests.filter(r => r.status === "pending");
  }

  static async findPendingBySender(senderId) {
    const requests = await this.findBySender(senderId);
    return requests.filter(r => r.status === "pending");
  }

  static async update(requestId, updateData) {
    const request = await this.findById(requestId);
    if (!request) return null;
    
    const updatedRequest = { ...request, ...updateData };
    const requestKey = buildRequestKey(requestId);
    
    await redisSet(requestKey, updatedRequest);
    return updatedRequest;
  }

  static async delete(requestId) {
    const request = await this.findById(requestId);
    if (!request) return false;
    
    const requestKey = buildRequestKey(requestId);
    
    // Remove from user requests sets
    await redisSRem(buildUserSentRequestsKey(String(request.sender)), String(requestId));
    await redisSRem(buildUserReceivedRequestsKey(String(request.receiver)), String(requestId));
    
    // Delete request data
    await redisDel(requestKey);
    
    return true;
  }

  static async exists(requestId) {
    const requestKey = buildRequestKey(requestId);
    return await redisExists(requestKey);
  }

  static async getSentRequestsCount(userId) {
    const requestIds = await redisSMembers(buildUserSentRequestsKey(String(userId)));
    return requestIds.length;
  }

  static async getReceivedRequestsCount(userId) {
    const requestIds = await redisSMembers(buildUserReceivedRequestsKey(String(userId)));
    return requestIds.length;
  }

  static async hasPendingRequest(senderId, receiverId) {
    const senderRequests = await this.findBySender(senderId);
    return senderRequests.some(r => r.receiver === receiverId && r.status === "pending");
  }

  static async hasReceivedPendingRequest(senderId, receiverId) {
    const receiverRequests = await this.findByReceiver(receiverId);
    return receiverRequests.some(r => r.sender === senderId && r.status === "pending");
  }
}
