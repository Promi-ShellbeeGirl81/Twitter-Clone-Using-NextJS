import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postText: {
    type: String,
    default:" ",
  },
  postMedia: {
    type: [String],
    default: [],
  },
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
  viewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
export default Post;
