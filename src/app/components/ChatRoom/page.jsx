"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socketClient";
import ChatForm from "@/app/components/ChatForm/page";
import ChatMessage from "@/app/components/ChatMessage/page";
import { fetchUserIdByEmail, fetchUserById } from "@/utils/api/userApi";
import styles from "./page.module.css";

export default function ChatRoom({ selectedUser, setMessages }) {
  const { senderId } = useParams();
  const { data: session } = useSession();
  const [messages, setMessagesState] = useState([]);
  const [receiver, setReceiver] = useState(selectedUser);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState({});
  const [roomId, setRoomId] = useState("");
  const [seenMessages, setSeenMessages] = useState(new Set());
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  const messagesContainerRef = useRef(null);

  // Fetch current user's ID
  useEffect(() => {
    if (!session?.user?.email) return;
    const getUserId = async () => {
      const id = await fetchUserIdByEmail(session.user.email);
      setUserId(id);
    };
    getUserId();
  }, [session?.user?.email]);

  // Fetch receiver details
  useEffect(() => {
    if (selectedUser) {
      setReceiver(selectedUser);
    }
  }, [selectedUser]);

  // Fetch chat history
  useEffect(() => {
    if (!userId || !selectedUser?._id) return;
    const fetchMessages = async () => {
      if (!userId || !selectedUser?._id) return;
      try {
        const res = await fetch(
          `/api/messages?sender=${userId}&receiver=${selectedUser._id}`
        );
        const data = await res.json();
        if (res.ok) {
          const formattedMessages = data.map((msg) => ({
            ...msg,
            createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString(),
          }));
          setMessagesState(formattedMessages);
          setMessages(formattedMessages); // Update parent state
        } else {
          console.error("Error fetching messages:", data.message);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };    
    fetchMessages();
  }, [userId, selectedUser?._id, setMessages]);

  // Room ID generation and socket handling
  useEffect(() => {
    if (!userId || !selectedUser?._id) return;
    const roomId = [userId, selectedUser._id].sort().join("_");
    setRoomId(roomId);
  
    const handleSocketConnect = () => {
      console.log("Socket connected, emitting join-room:", roomId);
      socket.emit("join-room", { room: roomId, username: userId });
    };
  
    const handleIncomingMessage = (data) => {
      console.log("Incoming message createdAt:", data.createdAt); // Debugging

      const formattedMessage = {
        ...data,
        messageContent: data.messageContent || data.message,
        createdAt: data.createdAt || new Date().toISOString(), // Fallback to ISO string
      };

      setMessagesState((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg.messageId === formattedMessage.messageId);
        if (messageExists) return prevMessages;

        const updatedMessages = [...prevMessages, formattedMessage];
        updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return updatedMessages;
      });

      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    };    
  
    const handleUserJoined = (message) => {
      console.log("User joined event received:", message);
      setMessages((prev) => [
        ...prev,
        { sender: "system", message, timestamp: new Date().toISOString() },
      ]);
    };
  
    if (socket.connected) {
      handleSocketConnect();
    } else {
      socket.on("connect", handleSocketConnect);
    }
  
    socket.on("message", handleIncomingMessage);
    socket.on("user_joined", handleUserJoined);
  
    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("message", handleIncomingMessage);
      socket.off("user_joined", handleUserJoined);
    };
  }, [userId, selectedUser?._id]);

  const fetchUserDetails = async (userId) => {
    if (!users[userId]) {
      try {
        const user = await fetchUserById(userId);
        setUsers((prev) => ({ ...prev, [userId]: user.name })); // Update users state with user name
      } catch (error) {
        console.error(`Error fetching user (${userId}):`, error);
      }
    }
  };

  // Ensure `fetchUserDetails` is called for all relevant users
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((msg) => {
        fetchUserDetails(msg.sender);
      });
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message || typeof message !== "string" || !message.trim()) {
      console.error("Invalid message:", message);
      return;
    }

    const timestamp = new Date().toISOString(); // Ensure ISO format

    const messageData = {
      room: roomId,
      message: message.trim(),
      sender: userId,
      receiver: receiver._id,
      messageId: new Date().getTime().toString(), // Generate unique ID
      createdAt: timestamp, // Use ISO string
    };

    try {
      console.log("Emitting message to socket:", messageData);
      socket.emit("message", messageData);

      // Optimistically update the UI with ISO timestamp
      setMessages((prev) => {
        const updatedMessages = [
          ...prev,
          { ...messageData }, // Use the same messageData object
        ];
        updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.roomHeading}>
        <div className={styles.userInfo}>
          <img
            className={styles.img}
            src={receiver?.profilePic || defaultImage}
            alt={receiver?.name}
          />
          <div className={styles.userDetails}>
            <h1>{receiver?.name}</h1>
            <p>@{receiver?.email}</p>
          </div>
        </div>
      </div>
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={styles.messageWrapper}>
             <ChatMessage
  sender={users[msg.sender] || msg.sender}
  message={msg.messageContent}
  isOwnMessage={msg.sender === userId}
  timestamp={msg.createdAt || "Unknown Date"} // Use formatted createdAt or fallback
/>
            </div>
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </div>
      <ChatForm onSendMessage={handleSendMessage} />
    </div>
  );
}