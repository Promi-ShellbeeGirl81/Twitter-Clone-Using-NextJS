import Message from "@/models/message";
import mongoose from "mongoose";

export const MessageLastRepository = {
  async findMessages(sender, receiver) {
    return await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: -1 });
  },
};

export const MessageSeenRepository = {
    async updateSeenStatus(messageId, seenBy) {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error("Invalid messageId format");
      }
  
      const objectId = new mongoose.Types.ObjectId(messageId);
  
      return await Message.findByIdAndUpdate(
        objectId,
        { seenAt: new Date(), seenBy },
        { new: true }
      ).select("sender receiver messageContent messageType seenAt seenBy");
    },
  };
  
  export const MessageSelfRepository = {
    async checkSelfMessage(userId) {
      return await Message.exists({ sender: userId, receiver: userId });
    },
  };
