import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageContent: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false, // Indicates whether the message has been delivered
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
console.log("All Mongoose Models:", mongoose.models);

export default Message;
