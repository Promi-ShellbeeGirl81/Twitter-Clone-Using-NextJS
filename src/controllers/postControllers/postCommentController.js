import { NextResponse } from "next/server";
import { getPostByIdWithComments } from "@/services/postService";

export async function POST(req) {
  try {
    const requestBody = await req.json();
    const { userId } = requestBody;
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const postId = pathSegments[pathSegments.length - 2];

    const updatedPost = await toggleLikePost(postId, userId);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function GET(req, { postId }) {
    try {
      if (!postId) {
        throw new Error("No postId provided");
      }
      const { post, comments } = await getPostByIdWithComments(postId);
  
      if (!post) {
        return new NextResponse(JSON.stringify({ message: "Post not found" }), { status: 404 });
      }
  
      return new NextResponse(
        JSON.stringify({ post, comments }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ message: "Error fetching post." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }