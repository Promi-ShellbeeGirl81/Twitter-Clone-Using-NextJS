import mongoose from "mongoose";
import { findPostById, savePost, getPostById, getCommentsByPostId , getAllPosts, createPost } from "@/repositories/postRepository";
import User from "@/models/user";

export const toggleLikePost = async (postId, userId) => {
  console.log("toggleLikePost called with:", { postId, userId });

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid post or user ID");
  }

  const post = await findPostById(postId);
  if (!post) {
    throw new Error("Post not found");
  }

  const likedBy = post.likedBy || [];

  const userIndex = likedBy.indexOf(userId);
  if (userIndex === -1) {
    likedBy.push(userId);
    post.likeCount += 1;
  } else {
    likedBy.splice(userIndex, 1);
    post.likeCount = Math.max(0, post.likeCount - 1); 
  }

  post.likedBy = likedBy;
  const updatedPost = await savePost(post);

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
