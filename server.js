import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Message from "./src/models/message.js";

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
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));

    socket.on("join-room", ({ room, username }) => {
      if (!room || !username) {
        console.error("Invalid join-room data:", { room, username });
        return;
      }
      socket.join(room);
      userSockets.set(username, socket.id);
      console.log(`User ${username} joined room ${room}`);
      io.to(room).emit("user_joined", `${username} joined room`);
    });

    socket.on("message", async (data) => {
      try {
        const { room, message, sender, receiver, messageId, createdAt } = data;
        const messageData = {
          sender,
          receiver,
          messageContent: message.trim(),
          messageId: messageId || new mongoose.Types.ObjectId().toString(),
          createdAt: createdAt
            ? new Date(createdAt).toISOString()
            : new Date().toISOString(),
        };

        console.log("Server - Incoming message:", messageData);

        // Save the message to the database
        const newMessage = new Message({
          sender,
          receiver,
          messageContent: messageData.messageContent,
          messageType: "text", // Assuming default type is "text"
          createdAt: messageData.createdAt,
          read: false, // Mark as unread initially
        });

        try {
          await newMessage.save();
          console.log("Server - Message successfully saved to database:", newMessage);
        } catch (dbError) {
          console.error("Server - Error saving message to database:", dbError.message);
          return;
        }

        // Emit the message to everyone in the room (sender and receiver)
        io.in(room).emit("message", messageData);
        io.emit("message", messageData);
      } catch (error) {
        console.error("Error handling message:", error.message);
      }
    });
    
    // When the user comes online, send undelivered messages
    socket.on("user_status", async ({ userId, status }) => {
      console.log(`User ${userId} status: ${status}`);
      
      if (status === "online") {
        onlineUsers.set(userId, true);
        userSockets.set(userId, socket.id);
        
        // Fetch undelivered messages from the database and send them
        const undeliveredMessages = await Message.find({ receiver: userId, read: false }).sort({ createdAt: 1 });
        
        if (undeliveredMessages.length > 0) {
          console.log(`Sending ${undeliveredMessages.length} undelivered messages to ${userId}`);
          undeliveredMessages.forEach((msg) => {
            io.to(socket.id).emit("message", {
              sender: msg.sender,
              receiver: msg.receiver,
              messageContent: msg.messageContent,
              messageId: msg._id.toString(),
              createdAt: msg.createdAt.toISOString(),
            });
          });
        
          // Mark messages as delivered after sending them
          await Message.updateMany({ receiver: userId, read: false }, { read: true });
        }
      } else {
        onlineUsers.delete(userId);
        userSockets.delete(userId);
      }
    
      io.emit("user_status_update", { userId, status });
    });    
    
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
  
    socket.on("sendMessage", async (data) => {
      try {
        const { messageContent, sender, receiver, messageType } = data;

        // Validate messageContent
        if (!messageContent || typeof messageContent !== "string" || !messageContent.trim()) {
          console.error("Invalid messageContent:", messageContent);
          throw new Error("Invalid message content");
        }

        // Validate other required fields
        if (!sender || !receiver || !messageType) {
          console.error("Missing required fields:", { sender, receiver, messageType });
          throw new Error("Missing required fields");
        }

        // Proceed with saving the message
        const newMessage = new Message({
          messageContent: messageContent.trim(),
          sender,
          receiver,
          messageType,
          createdAt: new Date(),
        });

        await newMessage.save();
        io.emit("message", newMessage);
      } catch (error) {
        console.error("Error handling sendMessage:", error.message);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          userSockets.delete(userId);
          io.emit("user_status_update", { userId, status: "offline" });
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
