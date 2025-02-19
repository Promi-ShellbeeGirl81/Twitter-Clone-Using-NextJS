import { NextResponse } from "next/server";
import { getPostByIdWithComments } from "@/services/postService";

export async function POST(req) {
  try {
    // Parse request body
    const requestBody = await req.json();
    const { userId } = requestBody;

    // Get postId from the URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/");
    const postId = pathSegments[pathSegments.length - 2];

    // Call the service to toggle like on the post
    const updatedPost = await toggleLikePost(postId, userId);

    // Return updated post data
    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    // Return error if something goes wrong
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function GET(req, { postId }) {
    try {
      if (!postId) {
        throw new Error("No postId provided");
      }
  
      // Call the service to get post and comments
      const { post, comments } = await getPostByIdWithComments(postId);
  
      if (!post) {
        return new NextResponse(JSON.stringify({ message: "Post not found" }), { status: 404 });
      }
  
      return new NextResponse(
        JSON.stringify({ post, comments }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error in controller:", error);
      return new NextResponse(
        JSON.stringify({ message: "Error fetching post." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }