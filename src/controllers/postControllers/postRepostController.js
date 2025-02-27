import Post from "@/models/post";
import User from "@/models/user";
import { connectToDatabase } from "@/lib/mongodb";

export const handleRepost = async (session, postId, isQuote, quoteText = "", postMedia = []) => {
  try {
    console.log("📩 Incoming Repost Request");

    await connectToDatabase();
    
    if (!session?.user?.email) {
      throw new Error("Unauthorized request");
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      throw new Error("User not found");
    }

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      throw new Error("Original post not found");
    }

    const loggedInUserId = user._id.toString();
    const hasNonQuoteRepost = originalPost.repostedBy.includes(loggedInUserId);
    let alreadyReposted = false;

    if (!isQuote) {
      if (hasNonQuoteRepost) {
        console.log("🚫 User already reposted this post, undoing repost");
        originalPost.repostedBy = originalPost.repostedBy.filter(id => id.toString() !== loggedInUserId);
        alreadyReposted = true;
      } else {
        console.log("✅ Adding Repost");
        originalPost.repostedBy.push(loggedInUserId);
      }
      await originalPost.save();
    } else {
      console.log("✏️ Creating Quote Post");
      await Post.create({
        userId: loggedInUserId,
        postText: quoteText,
        postMedia,
        originalPostId: originalPost._id,
        isQuote: true,
      });

      if (!originalPost.repostedBy.includes(loggedInUserId)) {
        originalPost.repostedBy.push(loggedInUserId);
        await originalPost.save();
      }
    }

    // ✅ Recalculate Repost Count
    const quoteRepostCount = await Post.countDocuments({ originalPostId: originalPost._id, isQuote: true });
    originalPost.repostCount = originalPost.repostedBy.length + quoteRepostCount;
    await originalPost.save();

    console.log("✅ Repost Success:", { repostCount: originalPost.repostCount });

    return {
      message: isQuote ? "Quote repost successful" : alreadyReposted ? "Undo repost successful" : "Repost successful",
      repostCount: originalPost.repostCount,
    };
  } catch (error) {
    console.error("❌ Repost Error:", error);
    throw new Error("Repost action failed.");
  }
};
