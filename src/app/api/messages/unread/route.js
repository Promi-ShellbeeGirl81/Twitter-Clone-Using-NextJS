import Message from "@/models/message";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ message: "Missing userId" }), { status: 400 });
    }

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      seenAt: null
    });

    return new Response(JSON.stringify({ count: unreadCount }), { status: 200 });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
