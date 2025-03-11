import { Server } from "socket.io";

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("WebSocket server is already running.");
    res.end();
    return;
  }

  console.log("Initializing WebSocket server...");
  const io = new Server(res.socket.server, {
    path: "/api/socket",
    cors: {
      origin: "*", // Allow all origins for testing
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  res.socket.server.io = io;
  res.end();
}
