import { Server } from "socket.io";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
    pingInterval: 10000, // send heartbeat every 10s
    pingTimeout: 30000, // wait 30s before disconnecting
  });

  io.on("connection", (socket) => {
    console.log("New Socket.IO client connected (ID:", socket.id, ")");

    // any event from the client
    socket.onAny((event, data) => {
      console.log(`📩 Received event: ${event} | Data:`, data);

      // reply
      socket.emit("reply", `You said: ${data}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("Client disconnected:", reason);
    });
  });

  console.log("Socket.IO server initialized");
}
