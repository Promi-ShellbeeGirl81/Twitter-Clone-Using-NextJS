import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postText: {
      type: String,
      default: " ",
    },
    postMedia: {
      type: [String],
      default: [],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    originalPostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null, 
    },
    isQuote: {
      type: Boolean,
      default: false, 
    },
    repostedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    replyCount: {
      type: Number,
      default: 0,
    },
    repostCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    viewCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
export default Post;
