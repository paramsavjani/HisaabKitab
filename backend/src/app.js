import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { sendPushNotification } from "./notification.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());

app.use(bodyParser.json());

import userRouter from "./routes/user.route.js";
import friendRequestRouter from "./routes/request.route.js";
import friendRouter from "./routes/friend.route.js";
import transactionRouter from "./routes/transaction.route.js";

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/friendRequests", friendRequestRouter);
app.use("/api/v1/friends", friendRouter);
app.use("/api/v1/transactions", transactionRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  },
});

// Store io instance in app for access in controllers
app.set('io', io);

const onlineUsers = new Map();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.accessToken;
    if (!token) {
      throw new Error("Token not provided");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decodedToken;
    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  onlineUsers.set(socket.user.username, socket.id);

  socket.on("newTransaction", (transaction) => {
    const receiverSocketId = onlineUsers.get(transaction.friendUsername);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newTransaction", {
        ...transaction,
        friendUsername: null,
      });
    } else {
      const fcmToken = transaction.fcmToken;
      if (fcmToken) {
        let messageTitle;
        let messageBody;

        if (transaction.amount < 0) {
          messageTitle = "You Will Receive Money!";
          messageBody = `You will receive ₹${Math.abs(
            transaction.amount
          )} from ${socket.user.name}.`;
        } else if (transaction.amount > 0) {
          messageTitle = "Money Requested!";
          messageBody = `${socket.user.name} has requested ₹${Math.abs(
            transaction.amount
          )} from you.`;
        }

        const notificationColor =
          transaction.amount < 0 ? "#4CAF50" : "#FF5722";

        const message = {
          notification: {
            title: messageTitle,
            body: messageBody,
          },
          data: {
            path: `/transactions/${transaction.friendUsername}--${socket.user.username}`,
          },
          android: {
            notification: {
              clickAction: "OPEN_APP",
              color: notificationColor,
            },
          },
          token: fcmToken,
        };

        sendPushNotification(message);
      }
    }
  });

  socket.on(
    "acceptTransaction",
    ({ friendUsername, _id, fcmToken, transactionAmount }) => {
      const receiverSocketId = onlineUsers.get(friendUsername);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("acceptTransaction", _id);
      } else {
        if (fcmToken) {
          let message = {
            notification: {
              title: "Transaction Accepted",
              body: `Your request for ₹${Math.abs(
                transactionAmount
              )} from ${socket.user.name} has been accepted.`,
            },
            data: {
              path: `/transactions/${friendUsername}--${socket.user.username}`,
            },

            android: {
              notification: {
                clickAction: "OPEN_APP",
              },
            },
            token: fcmToken,
          };

          sendPushNotification(message);
        }
      }
    }
  );

  socket.on(
    "rejectTransaction",
    ({ friendUsername, _id, transactionAmount, fcmToken }) => {
      const receiverSocketId = onlineUsers.get(friendUsername);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("rejectTransaction", _id);
      } else {
        if (fcmToken) {
          let message = {
            notification: {
              title: "Transaction Rejected",
              body: `Your transaction request of ₹${Math.abs(
                transactionAmount
              )} to ${socket.user.name} has been denied.`,
            },
            data: {
              path: `/transactions/${friendUsername}--${socket.user.username}`,
            },

            android: {
              notification: {
                clickAction: "OPEN_APP",
              },
            },

            token: fcmToken,
          };

          sendPushNotification(message);
        }
      }
    }
  );

  socket.on("cancelTransaction", ({ friendUsername, _id }) => {
    const receiverSocketId = onlineUsers.get(friendUsername);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("cancelTransaction", _id);
    }
  });

  socket.on(
    "actionOnFriendRequest",
    ({ id, action, senderUsername, extra, fcmToken }) => {
      const receiverSocketId = onlineUsers.get(senderUsername);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("actionOnFriendRequest", {
          id,
          action,
          extra,
        });
      } else {
        if (fcmToken) {
          let message = {
            notification: {
              title: `Friend Request ${
                action === "accept" ? "Accepted" : "Declined"
              }`,
              body: `${extra.name} has ${action} your friend request.`,
            },

            data: {
              path: `/users/${extra.username}`,
            },

            android: {
              notification: {
                clickAction: "OPEN_APP",
              },
            },
            token: fcmToken,
          };

          sendPushNotification(message);
        }
      }
    }
  );

  socket.on("sendFriendRequest", ({ request, receiver, fcmToken }) => {
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("sendFriendRequest", request);
    } else {
      if (fcmToken) {
        let message = {
          notification: {
            title: "New Friend Request",
            body: `You have a friend request from ${request.name}.`,
          },

          data: {
            path: `/users/${request.username}`,
          },

          android: {
            notification: {
              clickAction: "OPEN_APP",
            },
          },
          token: fcmToken,
        };

        sendPushNotification(message);
      }
    }
  });

  socket.on(
    "cancelFriendRequest",
    ({ requestId, receiver, senderUsername }) => {
      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("cancelFriendRequest", {
          requestId,
          senderUsername,
        });
      }
    }
  );

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.user.username);
  });
});

export { httpServer };
