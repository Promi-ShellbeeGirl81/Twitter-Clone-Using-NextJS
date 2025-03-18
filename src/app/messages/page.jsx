"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ChatRoom from "@/app/components/ChatRoom/page";
import { fetchUserIdByEmail } from "@/utils/api/userApi";
import { MessageCirclePlusIcon, Search, Settings, ArrowLeft } from "lucide-react";
import { getLastMessage } from "@/app/components/ChatRoom/page";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user
  const [userId, setUserId] = useState(null); // Track current user ID
  const [messages, setMessages] = useState([]); // Track messages in parent
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }
        const data = await res.json();
    
        // Fetch last messages for each user
        const usersWithLastMessage = await Promise.all(data.map(async (user) => {
          const messageRes = await fetch(`/api/messages/last?userId=${user._id}`);
          const messageData = messageRes.ok ? await messageRes.json() : null;
          return { ...user, lastMessage: messageData };
        }));
    
        setUsers(usersWithLastMessage);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };    

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!session?.user?.email) return;
    const getUserId = async () => {
      const id = await fetchUserIdByEmail(session.user.email);
      setUserId(id);
    };
    getUserId();
  }, [session?.user?.email]);

  const handleUserSelect = async (user) => {
    if (!user || !user._id) {
      console.error("Selected user is invalid:", user);
      return;
    }
  
    console.log("Selected user:", user); 
    setSelectedUser({ ...user });
    setMessages([]); // Reset messages when a new user is selected
  };

  useEffect(() => {
    console.log("Updated selectedUser:", selectedUser);
  }, [selectedUser]);

  const getLastMessageForUser = (userId) => {
    const chatMessages = messages.filter(
      (msg) => (msg.sender === userId && msg.receiver === userId) || 
               (msg.sender === userId && msg.receiver === userId)
    );
  
    if (chatMessages.length === 0) return null;
  
    return chatMessages.reduce((latest, msg) => 
      new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest
    );
  };
  

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const lastMessage = user.lastMessage;
            
              return (
                <div
                  key={user._id}
                  className={`${styles.userItem} ${selectedUser?._id === user._id ? styles.selectedUser : ""}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <img src={user.profilePic || defaultImage} alt={user.name} />
                  <div className="userInfo">
                    <span className="userName">{user.name}</span>
                    <span className="userHandle">@{user.handle}</span>
                    {lastMessage ? (
                      <>
                        <span className="lastMessage">{lastMessage.messageContent}</span>
                        <span className="lastMessageTime">
                          {lastMessage.createdAt
                            ? new Date(lastMessage.createdAt).toLocaleString() // Format createdAt
                            : "Unknown Date"} {/* Fallback for missing dates */}
                        </span>
                      </>
                    ) : (
                      <span className="noMessages">No messages yet</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No users available</p>
          )}
        </div>
      </div>

      <div className={styles.chatContainer}>
        {selectedUser ? (
          <ChatRoom
            key={selectedUser._id}
            selectedUser={selectedUser}
            senderId={userId}
            setMessages={setMessages} // Pass setMessages as a prop
          />
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