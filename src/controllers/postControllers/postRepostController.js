import Post from "@/models/post";
import User from "@/models/user";
import { connectToDatabase } from "@/lib/mongodb";

export const handleRepost = async (session, postId, isQuote, quoteText = "", postMedia = []) => {
  try {
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
        originalPost.repostedBy = originalPost.repostedBy.filter(id => id.toString() !== loggedInUserId);
        alreadyReposted = true;
      } else {
        originalPost.repostedBy.push(loggedInUserId);
      }
      await originalPost.save();
    } else {
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
    const quoteRepostCount = await Post.countDocuments({ originalPostId: originalPost._id, isQuote: true });
    originalPost.repostCount = originalPost.repostedBy.length + quoteRepostCount;
    await originalPost.save();

    return {
      message: isQuote ? "Quote repost successful" : alreadyReposted ? "Undo repost successful" : "Repost successful",
      repostCount: originalPost.repostCount,
    };
  } catch (error) {
    throw new Error("Repost action failed.");
  }
};
