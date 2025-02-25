import { NextResponse } from "next/server";
import { fetchAllPosts, createNewPost } from "@/services/postService";

export async function GET(req) {
  try {
    const posts = await fetchAllPosts();

    if (!posts.length) {
      return new NextResponse(JSON.stringify({ message: "No posts available" }), { status: 404 });
    }

    return new NextResponse(JSON.stringify(posts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userEmail, postText, postMedia, parentId } = await req.json();

    if (!userEmail || (postText === "" && !postMedia?.length)) {
      return new NextResponse(JSON.stringify({ message: "Missing user email or post content" }), { status: 400 });
    }

    const savedPost = await createNewPost({ userEmail, postText, postMedia, parentId });

    return new NextResponse(JSON.stringify(savedPost), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }
}
