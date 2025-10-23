import http from "http";
import { WebSocketServer } from "ws";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    if (message.toString() === "sayHello") {
      ws.send("Hello World"); // reply to client
    } else {
      ws.send(`You said: ${message}`);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Start server (both REST + WebSocket)
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
