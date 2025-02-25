import Post from "@/models/post";

export async function handleRepost(postId, userId, undo, isQuote = false, quoteText = "") {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  // Check if the user already reposted (regular or quote)
  const alreadyReposted = post.repostedBy.includes(userId) || post.quotedReposts.some((quote) => quote.userId.toString() === userId);

  if (!undo && alreadyReposted) {
    throw new Error("You have already reposted this post.");
  }

  if (undo && !alreadyReposted) {
    throw new Error("You haven't reposted this post yet.");
  }

  // Undo repost logic
  if (undo) {
    const update = {
      $inc: { repostCount: -1 },
      $pull: { 
        repostedBy: userId, 
        quotedReposts: { userId: userId } 
      }
    };
    return await Post.findByIdAndUpdate(postId, update, { new: true });
  }

  // Regular repost
  if (!isQuote) {
    const update = {
      $inc: { repostCount: 1 },
      $addToSet: { repostedBy: userId }
    };
    return await Post.findByIdAndUpdate(postId, update, { new: true });
  }

  // Quote repost
  if (isQuote) {
    const update = {
      $inc: { repostCount: 1 },
      $addToSet: {
        quotedReposts: { userId: userId, quoteText }
      }
    };
    return await Post.findByIdAndUpdate(postId, update, { new: true });
  }
}
