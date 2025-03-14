import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Message from "@/models/message"; // Import the Message model

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  // Keep track of online users and their socket IDs
  const onlineUsers = new Map();
  const userSockets = new Map();
  const messageSeenStatus = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", ({ room, username }) => {
      socket.join(room);
      userSockets.set(username, socket.id);
      console.log(`User ${username} joined room ${room}`);
      io.to(room).emit("user_joined", `${username} joined room`);
    });

    // Handle user status updates
    socket.on("user_status", ({ userId, status }) => {
      console.log(`User ${userId} status: ${status}`);
      if (status === 'online') {
        onlineUsers.set(userId, true);
        userSockets.set(userId, socket.id);
      } else {
        onlineUsers.delete(userId);
        userSockets.delete(userId);
      }
      io.emit("user_status_update", { userId, status });
    });

    socket.on("message", async ({ room, message, sender, receiver, messageId, timestamp }) => {
      if (message.trim()) {
        console.log(`Message from ${sender} in room ${room}: ${message}`);
        const messageData = {
          sender,
          message,
          messageId: messageId || new mongoose.Types.ObjectId().toString(),
          seen: false,
          timestamp: timestamp || new Date().toISOString()
        };
        
        // Store message seen status
        messageSeenStatus.set(messageData.messageId, {
          seen: false,
          seenBy: new Set(),
          sender,
          receiver
        });

        // Save the message to the database
        const newMessage = new Message({
          sender: messageData.sender,
          receiver: messageData.receiver,
          messageContent: messageData.message,
          messageType: "text",
          _id: messageData.messageId,
          createdAt: messageData.timestamp,
        });

        await newMessage.save();

        io.in(room).emit("message", messageData);
        console.log(`Emitted message event to room ${room}`);
      }
    });

    // Handle message seen event
    socket.on("message_seen", async ({ room, messageId, seenBy }) => {
      const messageStatus = messageSeenStatus.get(messageId);
      if (messageStatus) {
        messageStatus.seenBy.add(seenBy);
        messageStatus.seen = true;
      
        if (onlineUsers.has(seenBy)) {
          io.in(room).emit("message_seen_update", { messageId, seenBy });

          // Update the seenAt field in the database
          await Message.findByIdAndUpdate(new mongoose.Types.ObjectId(messageId), { seenAt: new Date(), seenBy });

          console.log(`Message ${messageId} seen by ${seenBy} in room ${room}`);
        }
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          userSockets.delete(userId);
          io.emit("user_status_update", { userId, status: 'offline' });
          break;
        }
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server running on http://${hostname}:${port}`);
  });
});