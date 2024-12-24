import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync(
    "../hisaab--kitab-firebase-adminsdk-k7ftp-c8981318fa.json",
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

sendPushNotification(
  "cDCIafHCTFKZYjBzNGVhxw:APA91bFDbexTrmN4Gl1HeLanrEZZBMIVm-6-wDQ8ydg9P55_jGi9hQ9sIWW7V_bZLyIyVQVg5GsNJh5YwzdvLEAYOijei9G_zEolsI3yF6p4AAqub9-YLec",
  "title",
  "body"
);


export { sendPushNotification };
