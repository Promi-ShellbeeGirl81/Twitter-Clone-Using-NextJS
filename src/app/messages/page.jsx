"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ChatRoom from "@/app/components/ChatRoom/page";
import { fetchUserIdByEmail } from "@/utils/api/userApi";
import { MessageCirclePlusIcon, Search, Settings, ArrowLeft } from "lucide-react";
import { socket } from "@/lib/socketClient";

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
  const [messages, setMessages] = useState([]);

  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  // Fetch current user ID
  useEffect(() => {
    if (!session?.user?.email) return;
    const getUserId = async () => {
      try {
        const id = await fetchUserIdByEmail(session.user.email);
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    getUserId();
  }, [session?.user?.email]);

  // Fetch users who have messages
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        const data = await res.json();
        setAllUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [userId]);

  // Filter and sort users based on messages and search
  useEffect(() => {
    const filterUsers = async () => {
      if (!allUsers.length) return;

      let usersWithMessages = [];

      if (searchTerm) {
        usersWithMessages = allUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        usersWithMessages = await Promise.all(
          allUsers.map(async (user) => {
            const hasMessagesRes = await fetch(`/api/messages/with-session?userId=${user._id}&sessionId=${userId}`);
            const hasMessages = hasMessagesRes.ok ? await hasMessagesRes.json() : false;

            if (!hasMessages) return null;

            const messageRes = await fetch(`/api/messages?sender=${userId}&receiver=${user._id}`);
            const messageData = messageRes.ok ? await messageRes.json() : null;

            return {
              ...user,
              lastMessage: messageData?.[messageData.length - 1] || null,
            };
          })
        );
      }

      // Remove null values and sort by last message timestamp
      usersWithMessages = usersWithMessages.filter(Boolean).sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || 0;
        const bTime = b.lastMessage?.createdAt || 0;
        return new Date(bTime) - new Date(aTime);
      });

      setDisplayUsers(usersWithMessages);
    };

    filterUsers();
  }, [allUsers, searchTerm, userId]);

  // Handle user selection
  const handleUserSelect = (user) => {
    if (!user?._id) return;
    setSelectedUser({ ...user });
    setMessages([]);
  };

  // Handle online status and message updates
  useEffect(() => {
    const handleOnlineUsers = (userIds) => setOnlineUsers(new Set(userIds));

    const handleUserStatus = ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        status === "online" ? newSet.add(userId) : newSet.delete(userId);
        return newSet;
      });
    };

    const handleNewMessage = (message) => {
      if (message.receiver !== userId && message.sender !== userId) return;
      const otherUserId = message.sender === userId ? message.receiver : message.sender;
    
      setDisplayUsers(prev => {
        const updated = prev.map(user => 
          user._id === otherUserId ? { ...user, lastMessage: message } : user
        );
    
        // If the user doesn't exist in the list (e.g., offline user who wasn't previously shown), add them
        const userExists = updated.some(user => user._id === otherUserId);
        if (!userExists) {
          fetch(`/api/users/${otherUserId}`)
            .then(res => res.ok ? res.json() : null)
            .then(user => {
              if (user) {
                setDisplayUsers([...updated, { ...user, lastMessage: message }]);
              }
            });
        }
    
        // Sort users based on last message time
        return updated.sort((a, b) => (
          new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
        ));
      });
    };
    

    socket.on("online_users_list", handleOnlineUsers);
    socket.on("user_status_update", handleUserStatus);
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("online_users_list", handleOnlineUsers);
      socket.off("user_status_update", handleUserStatus);
      socket.off("message", handleNewMessage);
    };
  }, [userId]);

  return (
    <div className={styles.container}>
      {/* Left Sidebar */}
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
          <div className={`${styles.searchContainer} ${isFocused ? styles.focused : ""}`}>
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
                  <span className={styles.userName}>{user.name}</span>
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

      {/* Chat Container */}
      <div className={styles.chatContainer}>
        {selectedUser ? (
          <ChatRoom key={selectedUser._id} selectedUser={selectedUser} senderId={userId} setMessages={setMessages} />
        ) : (
          <div className={styles.placeholder}>
            <h2>Select a message</h2>
            <p>Start a conversation by selecting a user</p>
          </div>
        )}
      </div>
    </div>
  );
}
