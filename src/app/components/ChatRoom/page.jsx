"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socketClient";
import ChatForm from "@/app/components/ChatForm/page";
import ChatMessage from "@/app/components/ChatMessage/page";
import { fetchUserIdByEmail, fetchUserById } from "@/utils/api/userApi";
import styles from "./page.module.css";

export default function ChatRoom({ selectedUser }) {
  const { senderId } = useParams();
  const { data: session } = useSession();
  // Single source of truth for messages
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(selectedUser);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState({});
  const [roomId, setRoomId] = useState("");
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  const messagesContainerRef = useRef(null);

  // Fetch current user's ID based on session email
  useEffect(() => {
    if (!session?.user?.email) return;
    const getUserId = async () => {
      const id = await fetchUserIdByEmail(session.user.email);
      setUserId(id);
    };
    getUserId();
  }, [session?.user?.email]);

  // Emit user status to update onlineUsers on server
  useEffect(() => {
    if (userId) {
      socket.emit("user_status", { userId, status: "online" });
    }
  }, [userId]);

  // Update receiver when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setReceiver(selectedUser);
    }
  }, [selectedUser]);

  // Function to fetch chat history from the API
  const fetchMessages = async () => {
    if (!userId || !receiver?._id) return;
    try {
      const res = await fetch(
        `/api/messages?sender=${userId}&receiver=${receiver._id}`
      );
      const data = await res.json();
      if (res.ok) {
        const formattedMessages = data.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt
            ? new Date(msg.createdAt).toISOString()
            : new Date().toISOString(),
        }));
        setMessages(formattedMessages);
      } else {
        console.error("Error fetching messages:", data.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch chat history when userId or receiver changes
  useEffect(() => {
    if (!userId || !receiver?._id) return;
    fetchMessages();
  }, [userId, receiver?._id]);

  // Setup room ID and socket event handlers
  useEffect(() => {
    if (!userId || !receiver?._id) return;
    const roomId = [userId, receiver._id].sort().join("_");
    setRoomId(roomId);

    const handleSocketConnect = () => {
      console.log("Socket connected, joining room:", roomId);
      socket.emit("join-room", { room: roomId, username: userId });
    };

    const handleIncomingMessage = (data) => {
      const formattedMessage = {
        ...data,
        // Ensure the message content is set correctly
        messageContent: data.messageContent || data.message,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setMessages((prevMessages) => {
        // Prevent duplicate messages by checking messageId
        const messageExists = prevMessages.some(
          (msg) => msg.messageId === formattedMessage.messageId
        );
        if (messageExists) return prevMessages;
        const newMessages = [...prevMessages, formattedMessage];
        newMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        return newMessages;
      });

      // Auto-scroll to the bottom of the messages container
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    };

    const handleUserJoined = (message) => {
      console.log("User joined:", message);
      // Add a system message when a user joins, without fetching user details
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          messageContent: message,
          createdAt: new Date().toISOString(),
          messageId: new Date().getTime().toString(),
        },
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
  }, [userId, receiver?._id]);

  // Listen for user status updates to re-fetch missed messages if receiver comes online
  useEffect(() => {
    const handleUserStatusUpdate = ({ userId: updatedUserId, status }) => {
      console.log(`User ${updatedUserId} is now ${status}`);
      if (status === "online" && updatedUserId === receiver?._id) {
        console.log("Receiver is online, fetching missed messages...");
        fetchMessages();
      }
    };

    socket.on("user_status_update", handleUserStatusUpdate);
    return () => {
      socket.off("user_status_update", handleUserStatusUpdate);
    };
  }, [receiver]);

  // Fetch details (e.g., name) for any user present in messages if not already fetched.
  // Skip if the sender is "system" since there's no API for that.
  const fetchUserDetails = async (userId) => {
    if (userId === "system") return;
    if (!users[userId]) {
      try {
        const user = await fetchUserById(userId);
        setUsers((prev) => ({ ...prev, [userId]: user.name }));
      } catch (error) {
        console.error(`Error fetching user (${userId}):`, error);
      }
    }
  };

  // Ensure user details are fetched for all messages (ignoring system messages)
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((msg) => {
        if (msg.sender !== "system") {
          fetchUserDetails(msg.sender);
        }
      });
    }
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (message) => {
    if (!message || typeof message !== "string" || !message.trim()) {
      console.error("Invalid message:", message);
      return;
    }

    const timestamp = new Date().toISOString();
    // Include "messageContent" for consistency
    const messageData = {
      room: roomId,
      message: message.trim(),
      messageContent: message.trim(),
      sender: userId,
      receiver: receiver._id,
      messageId: new Date().getTime().toString(),
      createdAt: timestamp,
    };

    try {
      console.log("Sending message:", messageData);
      socket.emit("message", messageData);

      // Optimistically update the UI with the new message
      setMessages((prev) => {
        const newMessages = [...prev, { ...messageData }];
        newMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        return newMessages;
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
    messages
      .filter((msg) => msg.sender !== "system") // Filter out system messages
      .map((msg, index) => (
        <div key={msg.messageId || index} className={styles.messageWrapper}>
          <ChatMessage
            sender={users[msg.sender] || msg.sender}
            message={msg.messageContent}
            isOwnMessage={msg.sender === userId}
            timestamp={msg.createdAt || "Unknown Date"}
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
