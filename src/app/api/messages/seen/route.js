import mongoose from "mongoose";
import Message from "@/models/message";

export async function POST(req) {
  try {
    const { messageId, seenBy } = await req.json();

    // Validate required fields
    if (!messageId || !seenBy) {
      console.error("Missing required fields:", { messageId, seenBy });
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    // Validate if messageId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      console.error("Invalid messageId:", messageId);
      return new Response(JSON.stringify({ message: "Invalid messageId format" }), { status: 400 });
    }

    const objectId = new mongoose.Types.ObjectId(messageId);

    // Update the message's seen status
    const updatedMessage = await Message.findByIdAndUpdate(
      objectId,
      { seenAt: new Date(), seenBy },
      { new: true }
    ).select("sender receiver messageContent messageType seenAt seenBy");

    if (!updatedMessage) {
      console.error("Message not found:", messageId);
      return new Response(JSON.stringify({ message: "Message not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedMessage), { status: 200 });
  } catch (error) {
    console.error("Error updating message seen status:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
