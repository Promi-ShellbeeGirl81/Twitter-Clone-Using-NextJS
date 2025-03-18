import User from "@/models/user";
import Message from "@/models/message";

export async function POST(req) {
  try {
    const { sender, receiver, messageContent, messageType } = await req.json();

    // Validate required fields
    if (!sender || !receiver || !messageContent || !messageType) {
      console.error("Missing required fields:", { sender, receiver, messageContent, messageType });
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    // Ensure messageContent is a string and not empty
    if (typeof messageContent !== "string" || !messageContent.trim()) {
      console.error("Invalid message content:", messageContent);
      return new Response(JSON.stringify({ message: "Invalid message content" }), { status: 400 });
    }

    // Check if sender and receiver exist in the database
    const senderUser = await User.findById(sender);
    const receiverUser = await User.findById(receiver);

    if (!senderUser || !receiverUser) {
      console.error("Invalid sender or receiver:", { sender, receiver });
      return new Response(JSON.stringify({ message: "Invalid sender or receiver" }), { status: 400 });
    }

    // Create and save the new message
    const newMessage = new Message({
      sender,
      receiver,
      messageContent,
      messageType,
      createdAt: new Date(),
    });

    await newMessage.save();

    // Include all necessary fields in the response
    return new Response(
      JSON.stringify({
        ...newMessage.toObject(),
        messageId: newMessage._id.toString(),
        createdAt: newMessage.createdAt.toISOString(),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url); 
    const sender = searchParams.get("sender");
    const receiver = searchParams.get("receiver");

    if (!sender || !receiver) {
      return new Response(
        JSON.stringify({
          message: "Missing required parameters: sender and receiver",
        }),
        { status: 400 }
      );
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 }).select('sender receiver messageContent messageType createdAt'); 

    const formattedMessages = messages.map((msg) => {
      console.log("Message createdAt:", msg.createdAt); // Log createdAt for debugging
      return {
        ...msg.toObject(),
        createdAt: msg.createdAt ? msg.createdAt.toISOString() : null, // Ensure createdAt is an ISO string
      };
    });

    console.log("Messages fetched:", formattedMessages);

    return new Response(JSON.stringify(formattedMessages), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
