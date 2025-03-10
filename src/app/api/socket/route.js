import { Server } from "socket.io";

let io; // WebSocket server instance
let activeSockets = {};

export async function GET(req, res) {
  return new Response(
    JSON.stringify({ message: "WebSocket server is running" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(req, res) {
  if (res.socket.server.io) {
    console.log("✅ WebSocket server already running");
    res.end();
    return;
  }

  console.log("🚀 Initializing WebSocket server...");

  io = new Server(res.socket.server, {
    path: "/api/socket", // WebSocket path
    cors: {
      origin: "http://localhost:3000", // Allow all origins (make sure this is correctly set)
      methods: ["GET", "POST"], // Allow specific HTTP methods
    },
  });  
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // Register user with their user ID
    socket.on("register_user", (userId) => {
      activeSockets[userId] = socket.id;
      console.log(`👤 User ${userId} registered with socket ID ${socket.id}`);
    });

    // Handle message sending
    socket.on("send_message", ({ fromUser, toUser, message }) => {
      console.log(`📩 Message from ${fromUser} to ${toUser}: ${message}`);
      const recipientSocketId = activeSockets[toUser];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_message", { fromUser, message });
      } else {
        console.log(`❌ User ${toUser} is not connected`);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("🔌 User disconnected:", socket.id);
      for (const [userId, socketId] of Object.entries(activeSockets)) {
        if (socketId === socket.id) {
          delete activeSockets[userId];
          console.log(`👋 User ${userId} disconnected`);
        }
      }
    });
  });

  res.end();
}
