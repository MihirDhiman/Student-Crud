import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  "./secrets/firebase-service-account.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      path.resolve(__dirname, "..", serviceAccountPath)
    ),
    databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
  });
  console.log(" Admin initialized");
}

export async function sendToDevice(token, notification, data = {}) {
  const message = {
    token,
    notification,
    data,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
    return response;
  } catch (error) {
    console.error("FCM error:", error);
    throw error;
  }
}
