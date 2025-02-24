import Post from "@/models/post";

export async function handleRepost(postId, userId, undo) {
  // Fetch the post
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  // Check if already reposted
  const alreadyReposted = (post.repostedBy || []).includes(userId);

  if (!undo && alreadyReposted) {
    throw new Error("Already reposted");
  }

  if (undo && !alreadyReposted) {
    throw new Error("You haven't reposted this post yet");
  }

  // Update the post
  const update = undo
    ? { $inc: { repostCount: -1 }, $pull: { repostedBy: userId } }
    : { $inc: { repostCount: 1 }, $addToSet: { repostedBy: userId } };

  const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true });

  return updatedPost;
}
