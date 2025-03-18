import Message from "@/models/message";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ message: "Missing userId" }), { status: 400 });
    }

    const lastMessage = await Message.findOne({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    if (!lastMessage) {
      return new Response(JSON.stringify(null), { status: 200 });
    }

    return new Response(JSON.stringify(lastMessage), { status: 200 });
  } catch (error) {
    console.error("Error fetching last message:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
