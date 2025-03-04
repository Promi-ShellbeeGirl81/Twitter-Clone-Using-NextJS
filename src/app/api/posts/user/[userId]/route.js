import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/models/post";

export async function GET(req, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const userPosts = await Post.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ posts: userPosts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
