import { Server } from "socket.io";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // allow requests from anywhere
    },
  });

  io.on("connection", (socket) => {
    console.log("New Socket.IO client connected");

    // Listen for "sayHello" event
    socket.on("sayHello", () => {
      console.log("Received sayHello event");
      socket.emit("reply", "Hello World");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}
