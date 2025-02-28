import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "repost"],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: function () {
        return ["like", "comment", "repost"].includes(this.type);
      },
    },
    message: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

NotificationSchema.pre("save", async function (next) {
  if (this.type === "comment" && this.post) {
    const CommentPost = await mongoose.model("Post").findById(this.post);
    if (CommentPost && CommentPost.parentId) {
      this.post = CommentPost.parentId; 
    }
  }
  next();
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;
