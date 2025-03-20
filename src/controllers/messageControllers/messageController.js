import {
  MessageSeenService,
  MessageLastService,
  MessageSelfService,
} from "@/services/messageService.js";

export const MessageLastController = {
  async getMessages(req, res) {
    try {
      const url = new URL(req.url);
      const sender = url.searchParams.get("sender");
      const receiver = url.searchParams.get("receiver");

      const messages = await MessageLastService.getMessages(sender, receiver);
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(400).json({ message: error.message });
    }
  },
};
export const MessageSeenController = {
  async markMessageAsSeen(req, res) {
    try {
      const { messageId, seenBy } = req.body;

      const updatedMessage = await MessageSeenService.markMessageAsSeen(
        messageId,
        seenBy
      );
      return res.status(200).json(updatedMessage);
    } catch (error) {
      console.error("Error updating message seen status:", error);
      return res.status(400).json({ message: error.message });
    }
  },
};
export const MessageSelfController = {
    async checkSelfMessage(req, res) {
      try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
  
        const result = await MessageSelfService.hasSelfMessage(userId);
        return res.status(200).json(result);
      } catch (error) {
        console.error("Error checking self-messages:", error);
        return res.status(400).json({ message: error.message });
      }
    },
  };
