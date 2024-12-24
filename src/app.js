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

// Create HTTP Server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins
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
    console.log(transaction);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newTransaction", {
        ...transaction,
        friendUsername: null,
      });
    } else {
      const fcmToken = transaction.fcmToken;
      if (fcmToken) {
        const messageTitle = "New Transaction";
        const messageBody = `You have received a new transaction of ${transaction.amount} from ${transaction.friendName}`;
        sendPushNotification(fcmToken, messageTitle, messageBody);
      }
    }
  });

  socket.on("acceptTransaction", ({ friendUsername, transactionId }) => {
    const receiverSocketId = onlineUsers.get(friendUsername);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("acceptTransaction", transactionId);
    } else {
      console.log("user is offline");
    }
  });

  socket.on("rejectTransaction", ({ friendUsername, transactionId }) => {
    const receiverSocketId = onlineUsers.get(friendUsername);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("rejectTransaction", transactionId);
    } else {
      console.log("user is offline");
    }
  });

  socket.on("cancelTransaction", ({ friendUsername, transactionId }) => {
    const receiverSocketId = onlineUsers.get(friendUsername);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("cancelTransaction", transactionId);
    } else {
      console.log("user is offline");
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.user.username);
    console.log(`A user disconnected: ${socket.user.username}`);
  });
});

export { httpServer };
