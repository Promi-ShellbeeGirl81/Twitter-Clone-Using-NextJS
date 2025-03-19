"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import ChatRoom from "@/app/components/ChatRoom/page";
import { fetchUserIdByEmail } from "@/utils/api/userApi";
import { MessageCirclePlusIcon, Search, Settings, ArrowLeft } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState([]); // state to hold all users from API
  const [displayUsers, setDisplayUsers] = useState([]); // state for users to display in the sidebar
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user
  const [userId, setUserId] = useState(null); // Track current user ID
  const [messages, setMessages] = useState([]); // Track messages in parent
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  // Fetch all users once the userId is available.
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return; // Ensure userId is available before fetching users
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }
        const data = await res.json();
        setAllUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [userId]);

  // Update displayUsers based on the searchTerm.
  // When there's no search term, show only users that have messages (or are the current user with self messages).
  // When there's a search term, filter across all users regardless of messages.
  useEffect(() => {
    const filterUsers = async () => {
      if (!allUsers.length) return;

      // If search term exists, search across all users by name.
      if (searchTerm) {
        const matchingUsers = allUsers.filter((user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayUsers(matchingUsers);
      } else {
        // No search term: filter users that have message history.
        const usersWithMessages = await Promise.all(
          allUsers.map(async (user) => {
            // Check if current user has a self message
            const selfMessageRes = await fetch(
              `/api/messages/self?userId=${user._id}`
            );
            const hasSelfMessage = selfMessageRes.ok
              ? await selfMessageRes.json()
              : false;

            // Check if there are messages between this user and the session user
            const hasMessagesWithSession = await fetch(
              `/api/messages/with-session?userId=${user._id}&sessionId=${userId}`
            ).then((res) => (res.ok ? res.json() : false));

            // Include the user if either:
            // 1. It’s the current user and has self messages.
            // 2. There are messages with the session user.
            if ((hasSelfMessage && user._id === userId) || hasMessagesWithSession) {
              const messageRes = await fetch(
                `/api/messages?sender=${userId}&receiver=${user._id}`
              );
              const messageData = messageRes.ok ? await messageRes.json() : null;
              return {
                ...user,
                lastMessage: messageData?.[messageData.length - 1] || null,
              };
            }
            return null;
          })
        );
        // Remove null entries.
        setDisplayUsers(usersWithMessages.filter((user) => user !== null));
      }
    };

    filterUsers();
  }, [allUsers, searchTerm, userId]);

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

  const handleUserSelect = (user) => {
    if (!user || !user._id) {
      console.error("Selected user is invalid:", user);
      return;
    }
  
    console.log("Selected user:", user); 
    setSelectedUser({ ...user });
    setMessages([]); // Reset messages when a new user is selected
  };

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
          <div
            className={`${styles.searchContainer} ${
              isFocused ? styles.focused : ""
            }`}
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
            displayUsers.map((user) => {
              const lastMessage = user.lastMessage;
              return (
                <div
                  key={user._id}
                  className={`${styles.userItem} ${
                    selectedUser?._id === user._id ? styles.selectedUser : ""
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <img src={user.profilePic || defaultImage} alt={user.name} />
                  <div className="userInfo">
                    <span className="userName">{user.name}</span>
                    <span className="userHandle">@{user.handle}</span>
                    {lastMessage ? (
                      <>
                        <span className="lastMessage">
                          {lastMessage.messageContent}
                        </span>
                        <span className="lastMessageTime">
                          {lastMessage.createdAt
                            ? new Date(lastMessage.createdAt).toLocaleString()
                            : "Unknown Date"}
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

      {/* Chat Container */}
      <div className={styles.chatContainer}>
        {selectedUser ? (
          <ChatRoom
            key={selectedUser._id}
            selectedUser={selectedUser}
            senderId={userId}
            setMessages={setMessages}
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
