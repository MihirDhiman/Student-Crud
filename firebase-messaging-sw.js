importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

// 🔑 Replace these with your Firebase Web App config
const firebaseConfig = {
  apiKey: "AIzaSyA8xg7xcMgHabjcMA2SC9lGaPSNQ4WvA8E",
  authDomain: "student-crud-13ab9.firebaseapp.com",
  projectId: "student-crud-13ab9",
  storageBucket: "student-crud-13ab9.firebasestorage.app",
  messagingSenderId: "635295068649",
  appId: "1:635295068649:web:17417da9e074ba2bad5b78",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification?.title || "Background Message";
  const notificationOptions = {
    body: payload.notification?.body || "",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
