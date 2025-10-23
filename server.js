import http from "http";
import app from "./app.js";
import { initSocket } from "./socketio.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
