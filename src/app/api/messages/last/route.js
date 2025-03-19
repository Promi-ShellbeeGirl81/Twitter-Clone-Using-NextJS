import Message from "@/models/message";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const sender = url.searchParams.get("sender");
    const receiver = url.searchParams.get("receiver");

    if (!sender || !receiver) {
      return new Response(
        JSON.stringify({ message: "Missing sender or receiver" }),
        { status: 400 }
      );
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ createdAt: -1 });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
