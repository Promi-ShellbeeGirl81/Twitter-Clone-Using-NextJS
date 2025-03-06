import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import { ObjectId } from "mongodb"; // For validating ObjectId

export async function GET(req) {
  try {
    // Extract query parameters correctly in Next.js API routes
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const followerId = searchParams.get("followerId");

    // Validate query parameters
    if (!userId || !followerId) {
      return new Response(JSON.stringify({ error: "Missing user or follower ID" }), { status: 400 });
    }
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(followerId)) {
      return new Response(JSON.stringify({ error: "Invalid user or follower ID" }), { status: 400 });
    }

    await connectToDatabase();

    // Check if the user exists and if the followerId is in their followers array
    const user = await User.findOne({
      _id: new ObjectId(userId),
      followers: new ObjectId(followerId),
    });

    return new Response(JSON.stringify({ isFollowing: !!user }), { status: 200 });
  } catch (error) {
    console.error("Error fetching follow status:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
