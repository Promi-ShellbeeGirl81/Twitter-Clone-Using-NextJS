import Message from "@/models/message";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Missing required parameter: userId" }),
        { status: 400 }
      );
    }

    // Check if the user has sent a message to themselves
    const hasSelfMessage = await Message.exists({
      sender: userId,
      receiver: userId,
    });

    return new Response(JSON.stringify(hasSelfMessage), { status: 200 });
  } catch (error) {
    console.error("Error checking self-messages:", error);
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
