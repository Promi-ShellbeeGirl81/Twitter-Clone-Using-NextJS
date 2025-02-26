import Post from "@/models/post";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import User from "@/models/user";

export const POST = async (req) => {
  try {
    await connectToDatabase();

    // ✅ Parse request body correctly
    const {
      userId,
      postId,
      isQuote,
      quoteText = "",
      postMedia = [],
    } = await req.json();

    // ✅ Validate `postId`
    if (!postId) {
      return new NextResponse(
        JSON.stringify({ error: "Post ID is required" }),
        { status: 400 }
      );
    }

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return new NextResponse(
        JSON.stringify({ error: "Original post not found" }),
        { status: 404 }
      );
    }

    const session = await getServerSession(req);
    if (!session || !session.user || !session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized request" }),
        { status: 401 }
      );
    }

    const userEmail = session.user.email; 

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const loggedInUserId = user._id.toString();

    console.log("Original Post ID from DB:", originalPost._id);

    // ✅ Simple Repost (without a quote)
    if (!isQuote) {
      const userHasReposted = originalPost.repostedBy.includes(loggedInUserId);

      if (userHasReposted) {
        // Undo Repost
        originalPost.repostedBy = originalPost.repostedBy.filter(
          (id) => id.toString() !== userId
        );
        originalPost.repostCount = Math.max(originalPost.repostCount - 1, 0);
        await originalPost.save();

        return new NextResponse(
          JSON.stringify({ message: "Undo repost successful" }),
          { status: 200 }
        );
      } else {
        // Perform Repost
        originalPost.repostedBy.push(userId);
        originalPost.repostCount += 1;
        await originalPost.save();

        return new NextResponse(
          JSON.stringify({ message: "Repost successful" }),
          { status: 200 }
        );
      }
    }

    // ✅ Quote Repost (New Post with Reference)
    const quotedPost = await Post.create({
      userId,
      postText: quoteText, // Ensured default value ""
      postMedia, // Ensured default value []
      originalPostId: originalPost._id,
      isQuote: true,
    });

    console.log("Quoted Post Created:", quotedPost);

    // ✅ Ensure repost count updates correctly
    if (!originalPost.repostedBy.includes(userId)) {
      originalPost.repostedBy.push(userId);
      originalPost.repostCount += 1;
      await originalPost.save();
    }

    return new NextResponse(
      JSON.stringify({ message: "Quote repost successful", post: quotedPost }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Repost Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Repost action failed." }),
      { status: 500 }
    );
  }
};
