import Post from "@/models/post";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import {uploadMedia} from "@/lib/cloudinary";
import { uptime } from "process";

export async function GET() {
  try {
    await connectToDatabase();
    const posts = await Post.find();
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { userId, postText, postMedia } = await req.json();

    // Log the incoming data
    console.log("Received post data:", { userId, postText, postMedia });

    if (!userId) {
      console.error("Missing fields:", { userId, postText });
      return NextResponse.json(
        { message: "Missing user and postText" },
        { status: 400 }
      );
    }

    // Check if media is empty or not
    if (!postText && postMedia.length === 0) {
      console.error("No media or text uploaded");
    }

    const newPost = new Post({
      userId,
      postText,
      postMedia,
    });
    await newPost.save();
    return NextResponse.json(
      { message: "Post created successfully", post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in backend:", error);
    return NextResponse.json(
      { message: "Failed to create post", error: error.message },
      { status: 500 }
    );
  }
}



