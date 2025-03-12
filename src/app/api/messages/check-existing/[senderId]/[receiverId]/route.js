import Message from "@/models/message";  // Import the Message model to interact with the messages collection

export async function GET(req, { params }) {
  const { senderId, receiverId } = await params; // Access the dynamic segments from params

  try {
    // Query for an existing message between the sender and receiver
    const message = await Message.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },  // If the sender is senderId and receiver is receiverId
        { sender: receiverId, receiver: senderId },  // Or if the sender is receiverId and receiver is senderId
      ],
    }).sort({ createdAt: -1 });  // Sort by the most recent message

    if (message) {
      // If an existing message is found, return it
      return new Response(JSON.stringify(message), { status: 200 });
    } else {
      // If no message is found, return a 404 response
      return new Response(JSON.stringify({ message: "No existing message found" }), { status: 404 });
    }
  } catch (error) {
    console.error("Error finding existing message:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}
