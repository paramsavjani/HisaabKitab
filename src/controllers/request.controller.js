import { User } from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Friend } from "../models/Friend.model.js";
import { Request } from "../models/Request.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const sendRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const username = req.params.username;

  if (user.username === username) {
    return res.status(400).json({
      status: "error",
      message: "You cannot send a friend request to yourself !",
    });
  }

  const receiver = await User.findOne({ username });

  if (!receiver) {
    res.status(401).json({
      status: "error",
      message: "User not found",
    });
    return;
  }

  const isfriend = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: receiver._id },
      { userId: receiver._id, friendId: user._id },
    ],
  });

  if (isfriend) {
    return res.status(402).json({
      status: "error",
      message: "You are already friends with this user",
    });
  }

  const requestExists = await Request.findOne({
    sender: user._id,
    receiver: receiver._id,
    status: "pending",
  });

  if (requestExists) {
    res.status(403).json({
      status: "error",
      message: "You already sent a request to this user",
    });
    return;
  }

  const otherUserAlreadySentRequest = await Request.findOne({
    sender: receiver._id,
    receiver: user._id,
    status: "pending",
  }); 

  if (otherUserAlreadySentRequest) {
    res.status(403).json({
      status: "error",
      message: "This user already sent you a request",
    });
    return;
  }

  const request = new Request({
    sender: user._id,
    receiver: receiver._id,
  });

  await request.save();

  console.log(request._id);

  return res.status(200).json({
    status: "success",
    data: {
      requestId: request._id,
    },
  });
});

const receivedAll = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const requests = await Request.find({
    receiver: user._id,
    status: "pending",
  }).sort({ createdAt: -1 });

  const senders = await Promise.all(
    requests.map(async (request) => {
      const sender = await User.findById(request.sender).select(
        "username name profilePicture"
      );

      return {
        ...sender.toObject(),
        requestId: request._id,
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { senders }, "Requests fetched"));
});

const acceptRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "Unauthorized");
  }

  const requestId = req.params.requestId;

  if (!requestId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid request ID");
  }

  const request = await Request.findById(requestId);

  if (!request || request == null || request == undefined) {
    throw new ApiError(404, "Request not found");
  }

  if (request.receiver.toString() !== user._id.toString()) {
    throw new ApiError(403, "This request was not sent to you");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "This request is already accepted or rejected");
  }

  const alreadyFriends = await Friend.findOne({
    $or: [
      { userId: user._id, friendId: request.sender },
      { userId: request.sender, friendId: user._id },
    ],
  });

  if (alreadyFriends) {
    throw new ApiError(400, "You are already friends with this user");
  }

  request.status = "accepted";
  await request.save();

  const friend = new Friend({
    userId: user._id,
    friendId: request.sender,
  });

  await friend.save();

  return res.status(200).json(new ApiResponse(200, {}, "Request accepted"));
});

const denyRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "Unauthorized");
  }

  const requestId = req.params.requestId;

  if (!requestId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid request ID");
  }

  const request = await Request.findById(requestId);

  if (!request || request == null || request == undefined) {
    throw new ApiError(404, "Request not found");
  }

  if (request.receiver.toString() !== user._id.toString()) {
    throw new ApiError(403, "This request was not sent to you");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "This request is already accepted or rejected");
  }

  request.status = "rejected";
  await request.save();

  return res.status(200).json(new ApiResponse(200, {}, "Request denied"));
});

const sendAll = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const requests = await Request.find({
    sender: user._id,
    status: "pending",
  }).sort({ createdAt: -1 });

  const receivers = await Promise.all(
    requests.map(async (request) => {
      const receiver = await User.findById(request.receiver).select(
        "username name profilePicture"
      );

      return {
        ...receiver.toObject(),
        requestId: request._id,
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { receivers }, "Requests fetched"));
});

const cancelRequest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(400, "Unauthorized");
  }

  const requestId = req.params.requestId;

  if (!requestId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid request ID",
    });
  }

  const request = await Request.findById(requestId);

  if (!request || request == null || request == undefined) {
    return res.status(404).json({
      status: "error",
      message: "Request not found",
    });
  }

  if (request.sender.toString() !== user._id.toString()) {
    return res.status(403).json({
      status: "error",
      message: "This request was not sent by you",
    });
  }

  if (request.status !== "pending") {
    return res.status(400).json({
      status: "error",
      message: "This request is already accepted or rejected",
    });
  }

  const deleted = await Request.deleteOne({
    _id: requestId,
  });

  if (deleted.deletedCount === 0) {
    return res.status(500).json({
      status: "error",
      message: "An error occurred while cancelling the request",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Request cancelled",
  });
});

const alreadyRequested = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  const username = req.params.username;

  const receiver = await User.findOne({ username });

  if (!receiver) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  const requestExists = await Request.findOne({
    sender: user._id,
    receiver: receiver._id,
    status: "pending",
  });

  if (requestExists) {
    return res.status(200).json({
      status: "success",
      data: { requestId: requestExists._id },
    });
  }
});

export {
  sendRequest,
  receivedAll,
  acceptRequest,
  denyRequest,
  sendAll,
  cancelRequest,
  alreadyRequested,
};
