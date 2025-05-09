import mongoose from "mongoose";
import { findPostById, savePost, getPostById, getCommentsByPostId , getAllPosts, createPost} from "@/repositories/postRepository";
import User from "@/models/user";
import Post from "@/models/post";

export const toggleLikePost = async (postId, userId) => {
  console.log("toggleLikePost called with:", { postId, userId });

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid post or user ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const post = await findPostById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  const isLiked = post.likedBy.includes(userId);

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      [isLiked ? "$pull" : "$addToSet"]: { likedBy: userId },
      $set: { likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1 },
    },
    { new: true }
  );

  return updatedPost;
};

export async function getPostByIdWithComments(postId) {
  try {
    const post = await getPostById(postId);
    const comments = await getCommentsByPostId(postId);

    return { post, comments };
  } catch (error) {
    console.error("Error in service:", error);
    throw new Error("Error fetching post and comments");
  }
}

export async function fetchAllPosts() {
  try {
    return await getAllPosts();
  } catch (error) {
    console.error("Error in fetchAllPosts:", error);
    throw new Error("Error fetching posts");
  }
}

export async function createNewPost({ userEmail, postText, postMedia, parentId }) {
  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      throw new Error("User not found");
    }

    const postData = {
      userId: user._id,
      postText,
      postMedia,
      parentId,
    };

    return await createPost(postData);
  } catch (error) {
    console.error("Error in createNewPost:", error);
    throw new Error("Error creating post");
  }
}
