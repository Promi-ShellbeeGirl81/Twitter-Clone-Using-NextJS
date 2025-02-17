import Post from "@/models/post";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

const getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId).populate("userId"); 
    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Error fetching post");
  }
};

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { postId } = params;  

    if (postId) {
      const post = await getPostById(postId);
      if (!post) {
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
      }

      // Fetch comments for the post
      const comments = await Post.find({ parentId: postId }).populate("userId");

      return NextResponse.json({ post, comments }, { status: 200 });
    }

    return NextResponse.json({ message: "No postId provided" }, { status: 400 });

  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ message: "Error fetching post." }, { status: 500 });
  }
}
