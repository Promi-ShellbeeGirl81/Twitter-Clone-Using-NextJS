import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/models/post";

export async function GET(req, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required." }), {
        status: 400,
      });
    }

    await connectToDatabase(); // Ensure DB connection

    // Find all posts where the likedBy array contains the userId
    const likedPosts = await Post.find({ likedBy: userId }).sort({
      createdAt: -1,
    });

    if (!likedPosts.length) {
      return new Response(JSON.stringify({ error: "No liked posts found." }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(likedPosts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500 }
    );
  }
}
