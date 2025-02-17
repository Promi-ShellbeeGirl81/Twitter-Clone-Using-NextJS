import Post from "@/models/post";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";

// Helper function to get all posts and populate user information
const getAllPosts = async () => {
  try {
    const posts = await Post.find().populate("userId", "name avatar"); // Populate userId field with name and avatar
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Error fetching posts");
  }
};

export async function GET(req) {
  try {
    await connectToDatabase();

    // Fetch all posts
    const posts = await getAllPosts();

    // Log posts to see if userId is populated correctly
    console.log(posts);

    if (!posts.length) {
      return NextResponse.json({ message: "No posts available" }, { status: 404 });
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ message: "Error fetching posts." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { userEmail, postText, postMedia, parentId } = await req.json();

    if (!userEmail || (postText === "" && !postMedia?.length)) {
      return NextResponse.json({ message: "Missing user email or post content" }, { status: 400 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let newPost;

    if (parentId) {
      const parentPost = await Post.findById(parentId);
      if (!parentPost) {
        return NextResponse.json({ message: "Parent post not found" }, { status: 404 });
      }

      newPost = new Post({
        userId: user._id,
        postText,
        postMedia,
        parentId,
      });

      await Post.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
    } else {
      newPost = new Post({
        userId: user._id,
        postText,
        postMedia,
        parentId: null,
      });
    }

    await newPost.save();
    const savedPost = await Post.findById(newPost._id).populate("userId");

    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    console.error("Error in backend:", error);
    return NextResponse.json({ message: "Failed to create post", error: error.message }, { status: 500 });
  }
}
