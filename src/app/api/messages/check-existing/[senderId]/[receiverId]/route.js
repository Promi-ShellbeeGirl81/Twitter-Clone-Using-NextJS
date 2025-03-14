import Message from "@/models/message";  

export async function GET(req, { params }) {
  const { senderId, receiverId } = await params; 

  try {
    const message = await Message.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },  
        { sender: receiverId, receiver: senderId },  
      ],
    }).sort({ createdAt: -1 });  

    if (message) {
      return new Response(JSON.stringify(message), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: "No existing message found" }), { status: 404 });
    }
  } catch (error) {
    console.error("Error finding existing message:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}
