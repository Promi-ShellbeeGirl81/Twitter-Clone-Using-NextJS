export const fetchMessages = async (userId, receiverId) => {
  if (!userId || !receiverId) return [];
  try {
    const res = await fetch(
      `/api/messages?sender=${userId}&receiver=${receiverId}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch messages");

    return data.map((msg) => ({
      ...msg,
      messageId: msg._id,
      createdAt: new Date(msg.createdAt).toISOString(),
      seenAt: msg.seenAt,
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const fetchMessagesWithUser = async (userId, sessionId) => {
    try {
      const res = await fetch(`/api/messages/with-session?userId=${userId}&sessionId=${sessionId}`);
      if (!res.ok) return false;
      return await res.json();
    } catch (error) {
      console.error("Error fetching messages:", error);
      return false;
    }
  };
  