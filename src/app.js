import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { sendPushNotification } from "./notification.js";

// Initialize Express app
const app = express();

app.use(express.json());

// Enable CORS
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

// Import routes
import userRouter from "./routes/user.route.js";
import friendRequestRouter from "./routes/request.route.js";
import friendRouter from "./routes/friend.route.js";
import transactionRouter from "./routes/transaction.route.js";

// Routes
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
  console.log(`A user connected: ${socket.user.username}`);
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
          )} from ${transaction.friendName}.`;
        } else if (transaction.amount > 0) {
          messageTitle = "Money Requested!";
          messageBody = `${transaction.friendName} has requested ₹${Math.abs(
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
            transactionId: transaction.transactionId,
            actionType: "transaction",
            friendUsername: transaction.friendUsername,
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
    ({ friendUsername, transactionId, fcmToken, transactionAmount }) => {
      const receiverSocketId = onlineUsers.get(friendUsername);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("acceptTransaction", transactionId);
      } else {
        if (fcmToken) {
          let message = {
            notification: {
              title: "Transaction Accepted",
              body: `Your transaction of ₹${Math.abs(
                transactionAmount
              )} with ${friendUsername} has been accepted.`,
            },
            data: {
              transactionId: transactionId,
              actionType: "transaction",
              friendUsername: socket.user.username,
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
    ({ friendUsername, transactionId, transactionAmount, fcmToken }) => {
      const receiverSocketId = onlineUsers.get(friendUsername);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("rejectTransaction", transactionId);
      } else {
        if (fcmToken) {
          let message = {
            notification: {
              title: "Transaction Rejected",
              body: `Your transaction of ₹${Math.abs(
                transactionAmount
              )} with ${friendUsername} has been rejected.`,
            },
            data: {
              transactionId: transactionId,
              actionType: "transaction",
              friendUsername: socket.user.username,
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

  socket.on("cancelTransaction", ({ friendUsername, transactionId }) => {
    const receiverSocketId = onlineUsers.get(friendUsername);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("cancelTransaction", transactionId);
    } else {
    }
  });

  socket.on(
    "actionOnFriendRequest",
    ({ id, action, senderUsername, extra }) => {
      const receiverSocketId = onlineUsers.get(senderUsername);
      if (receiverSocketId) {
        console.log("ready");
        console.log(id, action, senderUsername, extra);
        io.to(receiverSocketId).emit("actionOnFriendRequest", {
          id,
          action,
          extra,
        });
      } else {
      }
    }
  );

  socket.on("sendFriendRequest", ({ request, receiver }) => {
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("sendFriendRequest", request);
    } else {
    }
  });

  socket.on(
    "cancelFriendRequest",
    ({ requestId, receiver, senderName, senderUsername }) => {
      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("cancelFriendRequest", {
          requestId,
          senderUsername,
        });
      } else {
      }
    }
  );

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.user.username);
    console.log(`A user disconnected: ${socket.user.username}`);
  });
});

export { httpServer };
