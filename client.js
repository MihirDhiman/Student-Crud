// client.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// When connected
socket.on("connect", () => {
  console.log("✅ Connected to server");

  // Send any message to server
  socket.emit("message", "Hello Server 👋");

  // You can send more messages later
  setTimeout(() => {
    socket.emit("message", "How are you?");
  }, 2000);
});

// When server replies
socket.on("reply", (msg) => {
  console.log("💬 Server replied:", msg);
});

// Handle disconnects
socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
