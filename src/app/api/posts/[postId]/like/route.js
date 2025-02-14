import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/models/post";
import mongoose from "mongoose";

export async function POST(req) {
    try {
      // Log the incoming request body
      const requestBody = await req.json();
      console.log("Request Body:", requestBody);
  
      await connectToDatabase();
  
      const url = new URL(req.url);
      const pathSegments = url.pathname.split("/");
      const postId = pathSegments[pathSegments.length - 2];
  
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return new Response(
          JSON.stringify({ error: "Invalid post ID" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      const { userId } = requestBody;
  
      const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

      // Ensure the userId is valid
      if (!isValidObjectId(userId)) {
        console.log("Invalid user ID:", userId);
        return new Response(
          JSON.stringify({ error: "Invalid user ID" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
  
      const post = await Post.findById(postId);
      if (!post) {
        return new Response(
          JSON.stringify({ error: "Post not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      // Toggle like on post
      const likedBy = post.likedBy || [];
  
      const userIndex = likedBy.indexOf(userId);
      if (userIndex === -1) {
        likedBy.push(userId); // Add user to likedBy
        post.likeCount += 1; // Increment like count
      } else {
        likedBy.splice(userIndex, 1); // Remove user from likedBy
        post.likeCount = Math.max(0, post.likeCount - 1); // Decrement like count, ensuring it doesn't go below 0
      }
  
      // Update the post with the new like count and likedBy array
      post.likedBy = likedBy;
      const updatedPost = await post.save();
  
      return new Response(JSON.stringify(updatedPost), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error updating like count:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update like count" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
  
