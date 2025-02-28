import Notification from "@/models/notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectToDatabase } from "@/lib/mongodb";

export async function createNotification({ receiverId, senderId, type, postId }) {
  try {
    await connectToDatabase();

    if (receiverId === senderId) {
      return { status: 200, data: { message: "No self-notifications" } };
    }

    const newNotification = new Notification({
      receiverId,
      senderId,
      type,
      postId,
    });

    await newNotification.save();
    return { status: 201, data: { message: "Notification created" } };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { status: 500, data: { message: "Something went wrong" } };
  }
}
export async function getNotifications(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { status: 401, data: { message: "Unauthorized" } };

    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePic")
      .populate("post", "content");

    return { status: 200, data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { status: 500, data: { message: "Error fetching notifications" } };
  }
}
export async function markNotificationAsRead(notificationId) {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) return { status: 404, data: { message: "Notification not found" } };

    notification.isRead = true;
    await notification.save();
    return { status: 200, data: { message: "Notification marked as read" } };
  } catch (error) {
    console.error("Error updating notification:", error);
    return { status: 500, data: { message: "Error updating notification" } };
  }
}
export async function deleteNotification(notificationId) {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) return { status: 404, data: { message: "Notification not found" } };

    await notification.deleteOne();
    return { status: 200, data: { message: "Notification deleted" } };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { status: 500, data: { message: "Error deleting notification" } };
  }
}
