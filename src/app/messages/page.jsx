"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ChatRoom from "@/app/components/ChatRoom/page";
import { fetchUserIdByEmail, fetchUsers } from "@/utils/api/userApi";
import { fetchMessagesWithUser, fetchMessages } from "@/utils/api/chatApi";
import { MessageCirclePlusIcon, Search, Settings, ArrowLeft } from "lucide-react";
import { socket } from "@/lib/socketClient";
import { defaultImage } from "../constants";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [allUsers, setAllUsers] = useState([]);
  const [displayUsers, setDisplayUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetchUserIdByEmail(session.user.email).then(setUserId).catch(console.error);
  }, [session?.user?.email]);

  useEffect(() => {
    if (!userId) return;
    fetchUsers().then(setAllUsers).catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!allUsers.length) return;

    (async () => {
      let usersWithMessages = searchTerm
        ? allUsers.filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : await Promise.all(
            allUsers.map(async (user) => {
              const hasMessages = await fetchMessagesWithUser(user._id, userId);
              if (!hasMessages) return null;
              const messageData = await fetchMessages(userId, user._id);
              return {
                ...user,
                lastMessage: messageData?.[messageData.length - 1] || null,
              };
            })
          );

      setDisplayUsers(
        usersWithMessages.filter(Boolean).sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || 0;
          const bTime = b.lastMessage?.createdAt || 0;
          return new Date(bTime) - new Date(aTime);
        })
      );
    })();
  }, [allUsers, searchTerm, userId]);

  const handleUserSelect = (user) => {
    if (!user?._id) return;
    setSelectedUser(user);
  };

  useEffect(() => {
    socket.on("online_users_list", (userIds) => setOnlineUsers(new Set(userIds)));
    socket.on("user_status_update", ({ userId, status }) =>
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        status === "online" ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      })
    );

    return () => {
      socket.off("online_users_list");
      socket.off("user_status_update");
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.headContainer}>
          <h1 className={styles.heading}>Messages</h1>
          <div className={styles.icon}>
            <Settings size={22} />
            <MessageCirclePlusIcon size={22} />
          </div>
        </div>
        <div className={styles.searchRow}>
          {isFocused && <ArrowLeft size={20} className={styles.arrowIcon} />}
          <div
            className={`${styles.searchContainer} ${isFocused ? styles.focused : ""}`}
          >
            <Search size={20} />
            <input
              type="text"
              className={styles.searchBox}
              placeholder="Search Direct Messages"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
        </div>
        <div className={styles.usersList}>
          {displayUsers.length > 0 ? (
            displayUsers.map((user) => (
              <div
                key={user._id}
                className={`${styles.userItem} ${selectedUser?._id === user._id ? styles.selectedUser : ""}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className={styles.userStatus}>
                  <img src={user.profilePic || defaultImage} alt={user.name} />
                  {onlineUsers.has(user._id) && <span className={styles.onlineDot} />}
                </div>
                <div className={styles.userInfo}>
                  <span className={`${styles.userName} ${!onlineUsers.has(user._id) ? styles.boldText : ""}`}>
                    {user.name}
                  </span>
                  {user.lastMessage ? (
                    <>
                      <span className={styles.lastMessage}>{user.lastMessage.messageContent}</span>
                      <span className={styles.lastMessageTime}>
                        {new Date(user.lastMessage.createdAt).toLocaleTimeString()}
                      </span>
                    </>
                  ) : (
                    <span className={styles.noMessages}>No messages yet</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No users available</p>
          )}
        </div>
      </div>
      <div className={styles.chatContainer}>
        {selectedUser ? <ChatRoom selectedUser={selectedUser} senderId={userId} /> : <div className={styles.placeholder}><h2>Select a message</h2></div>}
      </div>
    </div>
  );
}
