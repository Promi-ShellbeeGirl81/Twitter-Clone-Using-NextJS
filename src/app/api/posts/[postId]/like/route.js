import { NextResponse } from "next/server";
import { toggleLikePost } from "@/services/postService";

export async function POST(req) {
  try {
    const { userId } = await req.json();  
    const url = new URL(req.url);
    const postId = url.pathname.split("/").at(-2);  
  
    if (!postId || !userId) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }
  
    const updatedPost = await toggleLikePost(postId, userId);
    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error in like handler:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
