import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",  // Reference to Post
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",  // Reference to User
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
  commentMedia: {
    type: [String],  
    default: [],
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    default: [],
  }],
  replyCount: {
    type: Number,
    default: 0,
  },
  repostCount: {
    type: Number,
    default: 0,
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: "Comment",
  }],
  reposts: [{
    type: Schema.Types.ObjectId,
    ref: "User", 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export default Comment;
