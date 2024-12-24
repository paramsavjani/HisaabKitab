import admin from "firebase-admin";
import { User } from "./models/User.model.js";
import { readFileSync } from "fs";
// import "./hisaab--kitab-firebase-adminsdk-k7ftp-f4b43bba48.json"

const serviceAccount = JSON.parse(
  readFileSync(
    "./src/hisaab--kitab-firebase-adminsdk-k7ftp-f4b43bba48.json",
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = (fcmToken, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Notification sent successfully:", response);
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
    });
};

