"use client";
import { Settings } from "lucide-react";
import styles from "./page.module.css";
import NotificationMenu from "../components/NotificationMenu/page";
import { useSession} from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Notification() {
    const { data: session, status } = useSession();
    const [notifications, setNotifications] = useState([]);
    const[loading, setLoading] = useState(true);
    
      const router = useRouter();
    
      useEffect(() => {
        if (status !== "loading" && !session) {
          router.push("./");
        }
      }, [session, status, router]);

      useEffect(() => {
        if (session) {
          fetchNotifications();
        }
      }, [session]);

      const fetchNotifications = async () => {
        try {
          const res = await fetch("/api/notifications");
          if (!res.ok) throw new Error("Failed to fetch notifications");
          const data = await res.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      };
      const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

    
      if (status === "loading") {
        return (
          <div>
            <h1>Loading ...</h1>
          </div>
        );
      }
      if (!session) {
        return (
          <div>
            <h1>Please log in...</h1>
          </div>
        );
      }
    return(
        <>
        <div className={styles.headContainer}>
        <div className={styles.header}>
            <h2>Notifications</h2>
            <Settings/>
        </div>
        <NotificationMenu/>
        </div>
        <div className={styles.textContainer}>
        {notifications.length === 0 ? (
          <p>No new notifications</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className={styles.notificationItem}>
              <Image className={styles.notificationImage} src = {notification.sender?.image|| defaultImage} alt="notificationImage" width={30} height={30}/>
              <div className={styles.notificationText}>
              <strong>{notification.sender?.name}</strong> 
              {getNotificationMessage(notification)} : 
              <strong>{notification.post?.postText} </strong>
              </div>
              {!notification.isRead && <span className={styles.unreadDot}></span>}
            </div>
          ))
        )}
        </div>
        </>
    );

};

const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "repost":
        return "reposted your post";
      default:
        return "sent you a notification";
    }
  };