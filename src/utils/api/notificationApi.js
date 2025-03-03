export const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return await res.json();
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      return [];
    }
  };

  export const sendNotification = async ({ senderId, receiverId, type, postId }) => {
    if (!senderId || senderId === receiverId) return;
  
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          senderId,
          type,
          postId,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to send notification");
      return await res.json();
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  };