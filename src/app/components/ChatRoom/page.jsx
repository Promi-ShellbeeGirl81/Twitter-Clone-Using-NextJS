"use client";
import { useEffect, useState, useRef, useMemo } from "react";
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
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(selectedUser);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState({});
  const [roomId, setRoomId] = useState("");
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  const messagesContainerRef = useRef(null);

  // Get current user's ID based on session email
  useEffect(() => {
    if (!session?.user?.email) return;
    const getUserId = async () => {
      const id = await fetchUserIdByEmail(session.user.email);
      setUserId(id);
    };
    getUserId();
  }, [session?.user?.email]);

  // Set online status
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

  // Fetch messages from API and emit seen for messages sent to current user
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
          messageId: msg._id, // use server-generated id
          createdAt: new Date(msg.createdAt).toISOString(),
          seenAt: msg.seenAt,
        }));
        setMessages(formattedMessages);

        // For every message sent to the current user that hasn't been seen, emit "message_seen"
        formattedMessages.forEach((msg) => {
          if (msg.receiver === userId && !msg.seenAt) {
            const room = [userId, receiver._id].sort().join("_");
            console.log(`Emitting message_seen for message ${msg.messageId}`);
            socket.emit("message_seen", {
              room,
              messageId: msg.messageId,
              seenBy: userId,
            });
          }
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch messages when user or receiver changes
  useEffect(() => {
    if (!userId || !receiver?._id) return;
    fetchMessages();
  }, [userId, receiver?._id]);

  // Set up room and socket event handlers
  useEffect(() => {
    if (!userId || !receiver?._id) return;
    const room = [userId, receiver._id].sort().join("_");
    setRoomId(room);

    const handleSocketConnect = () => {
      console.log("Socket connected, joining room:", room);
      socket.emit("join-room", { room, username: userId });
    };

    if (socket.connected) {
      handleSocketConnect();
    } else {
      socket.on("connect", handleSocketConnect);
    }

    // When a new message arrives, update messages
    const handleIncomingMessage = (data) => {
      const formattedMessage = {
        ...data,
        messageContent: data.messageContent || data.message,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setMessages((prevMessages) => {
        const exists = prevMessages.some(
          (msg) => msg.messageId === formattedMessage.messageId
        );
        if (exists) {
          return prevMessages.map((msg) =>
            msg.messageId === formattedMessage.messageId
              ? formattedMessage
              : msg
          );
        }
        return [...prevMessages, formattedMessage].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });

      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    };

    socket.on("message", handleIncomingMessage);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("message", handleIncomingMessage);
    };
  }, [userId, receiver?._id]);

  useEffect(() => {
    const handleUserStatusUpdate = ({ userId: updatedUserId, status }) => {
      console.log(`User ${updatedUserId} is now ${status}`);
      if (status === "online" && updatedUserId === receiver?._id) {
        console.log("Receiver is online, updating last message if it's from the sender...");
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.sender === userId && !lastMessage.seenAt) {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...lastMessage,
              seenAt: new Date().toISOString(),
            };
            console.log("Updated last message with seenAt:", updated[updated.length - 1]);
            return updated;
          }
          return prev;
        });
      }
    }
    socket.on("user_status_update", handleUserStatusUpdate);
    return () => {
      socket.off("user_status_update", handleUserStatusUpdate);
    };
  }, [receiver, userId]);

  // Fetch details for any user present in messages
  const fetchUserDetails = async (uid) => {
    if (uid === "system") return;
    if (!users[uid]) {
      try {
        const user = await fetchUserById(uid);
        setUsers((prev) => ({ ...prev, [uid]: user.name }));
      } catch (error) {
        console.error(`Error fetching user (${uid}):`, error);
      }
    }
  };

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.sender !== "system") {
        fetchUserDetails(msg.sender);
      }
    });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (message) => {
    if (!message || typeof message !== "string" || !message.trim()) {
      console.error("Invalid message:", message);
      return;
    }
    const timestamp = new Date().toISOString();
    const messageData = {
      room: roomId,
      message: message.trim(),
      messageContent: message.trim(),
      sender: userId,
      receiver: receiver._id,
      createdAt: timestamp,
    };
    console.log("Sending message:", messageData);
    socket.emit("message", messageData);
  };

  useEffect(() => {
    const handleMessageSeenUpdate = ({ messageId, seenBy, seenAt }) => {
      console.log(`Received seen update for message ${messageId}`, seenAt);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageId === messageId ? { ...msg, seenAt } : msg
        )
      );
    };

    socket.on("message_seen_update", handleMessageSeenUpdate);
    return () => {
      socket.off("message_seen_update", handleMessageSeenUpdate);
    };
  }, []);
  const lastOverallMessageId = useMemo(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      return lastMessage.sender === userId ? lastMessage.messageId : null;
    }
    return null;
  }, [messages, userId]);

  // Compute the ID of the last message sent by the current user
  const lastSentMessageId = useMemo(() => {
    const sentMessages = messages.filter((msg) => msg.sender === userId);
    if (sentMessages.length) {
      const last = sentMessages[sentMessages.length - 1];
      console.log("Last sent message:", last);
      return last.messageId;
    }
    return null;
  }, [messages, userId]);
  useEffect(() => {
    // Simulate a seen update 5 seconds after messages load
    if (userId && messages.length > 0) {
      const timer = setTimeout(() => {
        setMessages((prev) => {
          const lastIndex = prev.reduce((last, msg, index) => 
            msg.sender === userId ? index : last, -1
          );
          if (lastIndex !== -1 && !prev[lastIndex].seenAt) {
            const updated = [...prev];
            updated[lastIndex] = {
              ...updated[lastIndex],
              seenAt: new Date().toISOString(),
            };
            console.log("Test update: last sent message updated with seenAt:", updated[lastIndex]);
            return updated;
          }
          return prev;
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userId, messages]);
  

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
            .filter((msg) => msg.sender !== "system")
            .map((msg, index) => (
              <div key={msg.messageId || index} className={styles.messageWrapper}>
                <ChatMessage
                  sender={users[msg.sender] || msg.sender}
                  message={msg.messageContent}
                  isOwnMessage={msg.sender === userId}
                  timestamp={msg.createdAt || "Unknown Date"}
                  seen={!!msg.seenAt}
                  seenAt={msg.seenAt}
                  isLastSentMessage={msg.messageId === lastOverallMessageId}
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
