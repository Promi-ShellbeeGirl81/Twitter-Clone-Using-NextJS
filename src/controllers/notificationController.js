import Notification from "@/models/notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import mongoose from "mongoose";

export async function createNotification({
  receiverId,
  senderId,
  type,
  postId,
}) {
  try {
    await connectToDatabase();

    if (receiverId === senderId) {
      return { status: 200, data: { message: "No self-notifications" } };
    }

    const existingNotification = await Notification.findOne({
      recipient: receiverId,
      sender: senderId,
      type,
      post: postId,
    });

    if (existingNotification) {
      existingNotification.updatedAt = new Date();
      await existingNotification.save();
      return { status: 200, data: { message: "Notification updated" } };
    }
    const newNotification = new Notification({
      recipient: receiverId,
      sender: senderId,
      type,
      post: postId,
    });

    try {
      await newNotification.save();
    } catch (error) {
      console.log(error);
    }
    return { status: 201, data: { message: "Notification created" } };
  } catch (error) {
    return { status: 500, data: { message: "Something went wrong" } };
  }
}
export async function getNotifications(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session) {
      return { status: 401, data: { message: "Unauthorized" } };
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return { status: 404, data: { message: "User not found" } };
    }

    if (!mongoose.Types.ObjectId.isValid(user._id)) {
      return { status: 400, data: { message: "Invalid user ID" } };
    }

    const notifications = await Notification.find({
      recipient: user._id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("post", "postText");

     if (notifications.length > 0) {
      console.log("📌 First Notification:", notifications[0]);
    }

    return { status: 200, data: notifications };
  } catch (error) {
    return { status: 500, data: { message: "Error fetching notifications" } };
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification)
      return { status: 404, data: { message: "Notification not found" } };

    notification.isRead = true;
    await notification.save();
    return { status: 200, data: { message: "Notification marked as read" } };
  } catch (error) {
    return { status: 500, data: { message: "Error updating notification" } };
  }
}
export async function deleteNotification(notificationId) {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification)
      return { status: 404, data: { message: "Notification not found" } };

    await notification.deleteOne();
    return { status: 200, data: { message: "Notification deleted" } };
  } catch (error) {
    return { status: 500, data: { message: "Error deleting notification" } };
  }
}
