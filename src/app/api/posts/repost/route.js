import Post from "@/models/post";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const POST = async (req) => {
  try {
    await connectToDatabase();
    const { userId, postId, isQuote, quoteText, postMedia } = await req.json();

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return new NextResponse(
        JSON.stringify({ error: "Original post not found" }),
        { status: 404 }
      );
    }

    // ✅ Check for existing repost without a quote
    if (!isQuote) {
      if (originalPost.repostedBy.includes(userId)) {
        // Undo simple repost
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
        // Perform simple repost (without quote)
        originalPost.repostedBy.push(userId);
        originalPost.repostCount += 1;
        await originalPost.save();

        return new NextResponse(
          JSON.stringify({ message: "Repost successful" }),
          { status: 200 }
        );
      }
    }

    console.log("Original Post ID from DB:", originalPost._id);

const quotedPost = await Post.create({
  userId,
  postText: quoteText || "",
  postMedia: postMedia || [],
  originalPostId: originalPost._id, // ✅ Should pass this
  isQuote: true,
});

console.log("Quoted Post Created:", quotedPost);


    // ✅ Update repost count and repostedBy array
    originalPost.repostedBy.push(userId);
    originalPost.repostCount += 1;
    await originalPost.save();

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
