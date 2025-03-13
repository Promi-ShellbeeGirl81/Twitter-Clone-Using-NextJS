import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", ({ room, username }) => {
      socket.join(room);
      console.log(`User ${username} joined room ${room}`);
      io.to(room).emit("user_joined", `${username} joined room`);
      console.log(`Emitted user_joined event to room ${room}`);
      console.log(`Users in room ${room}:`, io.sockets.adapter.rooms.get(room));
    });

    socket.on("message", ({ room, message, sender }) => {
      if (message.trim()) {
        console.log(`Message from ${sender} in room ${room}: ${message}`);
        io.in(room).emit("message", { sender, message });
        console.log(`Emitted message event to room ${room}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Start the HTTP server after setting up socket events
  httpServer.listen(port, () => {
    console.log(`Server running on http://${hostname}:${port}`);
  });
});