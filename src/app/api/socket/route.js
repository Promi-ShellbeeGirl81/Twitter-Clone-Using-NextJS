import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,  
  },
};

export async function POST(req, res) {
  const io = new Server(res.socket.server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    
    socket.on("send_message", (message) => {
      console.log("Message received:", message);
      io.emit("receive_message", message); 
    });

   socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  res.socket.server.io = io;

  return new Response(
    JSON.stringify({ message: "WebSocket server initialized" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function GET(req) {
  return new Response(
    JSON.stringify({ message: "WebSocket server is running" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
