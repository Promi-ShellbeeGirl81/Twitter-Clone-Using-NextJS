import { MessageSeenRepository, MessageLastRepository, MessageSelfRepository } from "@/repositories/messageRepository.js";

export const MessageLastService = {
  async getMessages(sender, receiver) {
    if (!sender || !receiver) {
      throw new Error("Missing sender or receiver");
    }
    return await MessageLastRepository.findMessages(sender, receiver);
  },
};

export const MessageSeenService = {
    async markMessageAsSeen(messageId, seenBy) {
      if (!messageId || !seenBy) {
        throw new Error("Missing required fields");
      }
  
      const updatedMessage = await MessageSeenRepository.updateSeenStatus(messageId, seenBy);
  
      if (!updatedMessage) {
        throw new Error("Message not found");
      }
  
      return updatedMessage;
    },
  };
  export const MessageSelfService = {
    async hasSelfMessage(userId) {
      if (!userId) {
        throw new Error("Missing required parameter: userId");
      }
  
      return await MessageSelfRepository.checkSelfMessage(userId);
    },
  };
