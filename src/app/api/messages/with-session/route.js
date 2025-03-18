import Message from "@/models/message";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId || !sessionId) {
      return new Response(
        JSON.stringify({ message: "Missing required parameters: userId and sessionId" }),
        { status: 400 }
      );
    }

    // Check if there are messages between the user and the session user
    const hasMessagesWithSession = await Message.exists({
      $or: [
        { sender: userId, receiver: sessionId },
        { sender: sessionId, receiver: userId },
      ],
    });

    return new Response(JSON.stringify(hasMessagesWithSession), { status: 200 });
  } catch (error) {
    console.error("Error checking messages with session user:", error);
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
