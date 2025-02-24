import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { handleRepost } from "@/controllers/postControllers/postRepostController";

export async function POST(req, context) {
  await connectToDatabase();

  try {
    const { postId } = context.params;
    const { userId, undo } = await req.json();

    const updatedPost = await handleRepost(postId, userId, undo);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error updating repost status:", error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
