import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
// Option 1: Use environment variables (recommended)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} 
// Option 2: Use service account file
else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
// Option 3: Fallback to default path (if file exists and is valid)
else {
  try {
    const serviceAccountPath = join(__dirname, "../utils/hisaab--kitab-firebase-adminsdk-k7ftp-c8981318fa.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    
    // Check if it's a valid service account format
    if (!serviceAccount.project_id && serviceAccount.project_info?.project_id) {
      // Convert client config to service account format
      throw new Error("Invalid service account file format. Please use a Firebase Admin SDK service account key file, not a client configuration file.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
    console.error("Please provide FIREBASE_SERVICE_ACCOUNT environment variable or a valid service account key file.");
    // Initialize without credentials (will fail when trying to send notifications)
    // This allows the app to start but notifications won't work
    try {
      admin.initializeApp({
        projectId: "hisaab--kitab",
      });
    } catch (e) {
      console.error("Failed to initialize Firebase Admin:", e.message);
    }
  }
}

const sendPushNotification = (message) => {
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

export { sendPushNotification };
