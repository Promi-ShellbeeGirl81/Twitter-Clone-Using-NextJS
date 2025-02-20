import Post from "@/models/post";
import { connectToDatabase } from "@/lib/mongodb";

export const findPostById = async (postId) => {
  return await Post.findById(postId);
};

export const savePost = async (post) => {
  return await post.save();
};

export async function getPostById(postId) {
    try {
      await connectToDatabase();
      return await Post.findById(postId).populate("userId"); 
    } catch (error) {
      console.error("Error fetching post from DB:", error);
      throw new Error("Error fetching post");
    }
  }
  
  export async function getCommentsByPostId(postId) {
    try {
      await connectToDatabase();
      return await Post.find({ parentId: postId }).populate("userId"); 
    } catch (error) {
      console.error("Error fetching comments from DB:", error);
      throw new Error("Error fetching comments");
    }
  }

  export async function getAllPosts() {
    try {
      const posts = await Post.find().populate("userId", "name avatar");
      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Error fetching posts");
    }
  }
  
  export async function createPost(postData) {
    try {
      const newPost = new Post(postData);
      await newPost.save();
  
      if (postData.parentId) {
        await Post.findByIdAndUpdate(postData.parentId, { $inc: { replyCount: 1 } });
      }
  
      return await Post.findById(newPost._id).populate("userId");
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error("Error creating post");
    }
  }