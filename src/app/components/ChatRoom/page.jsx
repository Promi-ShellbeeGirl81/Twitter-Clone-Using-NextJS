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
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(selectedUser);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState({});
  const [roomId, setRoomId] = useState("");
  const [seenMessages, setSeenMessages] = useState(new Set());
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesContainerRef = useRef(null);
  const [isUserActive, setIsUserActive] = useState(true);
  const lastSeenTimeoutRef = useRef(null);

  // Get the current user's ID by email
  useEffect(() => {
    if (!session?.user?.email) return;
    const getUserId = async () => {
      const id = await fetchUserIdByEmail(session.user.email);
      setUserId(id);
    };
    getUserId();
  }, [session?.user?.email]);

  // Fetch receiver details if not provided by selectedUser
  useEffect(() => {
    if (selectedUser) {
      setReceiver(selectedUser);
    } else if (selectedUser?._id) {
      const fetchReceiver = async () => {
        try {
          const res = await fetch(`/api/users/${selectedUser._id}`);
          const data = await res.json();
          if (res.ok) {
            setReceiver(data);
            setUsers((prev) => ({ ...prev, [selectedUser._id]: data.name }));
          } else {
            console.error("Error fetching receiver:", data.message);
          }
        } catch (error) {
          console.error("Error fetching receiver:", error);
        }
      };
      fetchReceiver();
    }
  }, [selectedUser]);

  // Fetch chat history
  useEffect(() => {
    if (!userId || !selectedUser?._id) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/messages?sender=${userId}&receiver=${selectedUser._id}`
        );
        const data = await res.json();
        console.log("Server response:", res);
        console.log("Response data:", data);
        if (res.ok) {
          setMessages(data);
          data.forEach((msg) => fetchUserDetails(msg.sender));
        } else {
          console.error("Error fetching messages:", data.message);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [userId, selectedUser?._id]);

  // Room ID generation and socket handling
  useEffect(() => {
    if (!userId || !selectedUser?._id) return;
    const roomId = [userId, selectedUser._id].sort().join("_");
    setRoomId(roomId);
    console.log("Calculated roomId:", roomId);

    const handleSocketConnect = () => {
      console.log("Socket connected, emitting join-room:", roomId);
      socket.emit("join-room", { room: roomId, username: userId });
      console.log("Socket ID:", socket.id);
    };

    const handleIncomingMessage = (data) => {
      console.log("Message event received:", data);
      setMessages((prev) => {
        // Check if message already exists
        const messageExists = prev.some(msg => msg.messageId === data.messageId);
        if (messageExists) {
          return prev;
        }
        return [...prev, { ...data, messageContent: data.message }];
      });
      fetchUserDetails(data.sender);
    };

    if (socket.connected) {
      handleSocketConnect();
    } else {
      socket.on("connect", handleSocketConnect);
    }
    socket.on("message", handleIncomingMessage);
    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("message", handleIncomingMessage);
    };
  }, [userId, selectedUser?._id]);

  // Listen for user-joined event
  useEffect(() => {
    if (!userId || !selectedUser?._id) return;
    const handleUserJoined = (message) => {
      console.log("User joined event received:", message);
      setMessages((prev) => [...prev, { sender: "system", message }]);
    };
    socket.on("user_joined", handleUserJoined);
    return () => {
      socket.off("user_joined", handleUserJoined);
    };
  }, [userId, selectedUser?._id]);

  // Fetch both sender and receiver details
  useEffect(() => {
    if (!userId || !selectedUser?._id) return;
    const fetchUsersDetails = async () => {
      try {
        const senderDetails = await fetchUserById(userId);
        const receiverDetails = await fetchUserById(selectedUser._id);
        setUsers({
          [userId]: senderDetails.name,
          [selectedUser._id]: receiverDetails.name,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsersDetails();
  }, [userId, selectedUser?._id]);

  const fetchUserDetails = async (userId) => {
    if (!users[userId]) {
      try {
        const user = await fetchUserById(userId);
        setUsers((prev) => ({ ...prev, [userId]: user.name }));
      } catch (error) {
        console.error(`Error fetching user (${userId}):`, error);
      }
    }
  };

  const handleSendMessage = (message) => {
    if (!message || !message.trim()) {
      console.error("Invalid message content:", message);
      return;
    }
    if (!userId) {
      console.error("User ID is missing");
      return;
    }
    const messageData = {
      messageContent: message.trim(),
      sender: userId,
      receiver: receiver._id,
      messageType: "text",
      timestamp: new Date().toISOString(),
      messageId: Date.now().toString(),
    };
    console.log("Sending message:", messageData);
    
    // First create the message in the database
    createNewMessage(messageData).then(savedMessage => {
      // Only emit socket event after successful database save
      socket.emit("message", {
        room: roomId,
        message: messageData.messageContent,
        sender: userId,
        receiver: receiver._id,
        messageId: savedMessage.messageId,
        timestamp: savedMessage.timestamp,
      });
    });
  };

  const createNewMessage = async (messageData) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error creating message:", errorData);
        return null;
      }
      const message = await res.json();
      await fetchUserDetails(message.sender);
      return message;
    } catch (error) {
      console.error("Error creating message:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log("Socket connected:", socket.connected);
    socket.on("connect", () => {
      console.log("Socket connected (event)", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected", socket.id);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setIsUserActive(true);
      if (lastSeenTimeoutRef.current) {
        clearTimeout(lastSeenTimeoutRef.current);
      }
      lastSeenTimeoutRef.current = setTimeout(() => {
        setIsUserActive(false);
      }, 5000); // Consider user inactive after 5 seconds of no activity
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (lastSeenTimeoutRef.current) {
        clearTimeout(lastSeenTimeoutRef.current);
      }
    };
  }, []);

  // Handle online status
  useEffect(() => {
    if (!socket || !userId) return;

    socket.emit('user_status', { userId, status: 'online' });

    socket.on('user_status_update', ({ userId: updatedUserId, status }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(updatedUserId);
        } else {
          newSet.delete(updatedUserId);
        }
        return newSet;
      });
    });

    const handleVisibilityChange = () => {
      socket.emit('user_status', {
        userId,
        status: document.hidden ? 'away' : 'online'
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      socket.emit('user_status', { userId, status: 'offline' });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, userId]);

  // Update seen status only when user is actually viewing messages
  useEffect(() => {
    if (!messages.length || !roomId || !userId || !selectedUser?._id || !isUserActive) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const message = messages.find(m => m.messageId === messageId);
            
            if (message && message.sender === selectedUser._id && !seenMessages.has(messageId)) {
              console.log(`Marking message ${messageId} as seen - user is actively viewing`);
              socket.emit("message_seen", {
                room: roomId,
                messageId,
                seenBy: userId
              });
              setSeenMessages(prev => new Set([...prev, messageId]));
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all message elements
    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, [messages, roomId, userId, selectedUser?._id, isUserActive]);

  // Handle incoming messages and seen status
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleMessageSeen = ({ messageId, seenBy }) => {
      if (seenBy !== userId) {
        console.log(`Message ${messageId} was seen by ${seenBy}`);
        setSeenMessages(prev => {
          const newSet = new Set([...prev, messageId]);
          console.log('Updated seen messages:', [...newSet]);
          return newSet;
        });
      }
    };

    const handleIncomingMessage = (data) => {
      console.log("Message event received:", data);
      setMessages((prev) => {
        // Check if message already exists
        const messageExists = prev.some(msg => msg.messageId === data.messageId);
        if (messageExists) {
          return prev;
        }
        return [...prev, { ...data, messageContent: data.message }];
      });
      fetchUserDetails(data.sender);
    };

    socket.on("message_seen_update", handleMessageSeen);
    socket.on("message", handleIncomingMessage);

    return () => {
      socket.off("message_seen_update", handleMessageSeen);
      socket.off("message", handleIncomingMessage);
    };
  }, [socket, roomId, userId]);

  // Add a function to generate unique message IDs
  const generateUniqueId = (message, index) => {
    // If message has a messageId, use it as the base
    if (message.messageId) {
      return `${message.messageId}-${index}`;
    }
    
    // For system messages or messages without IDs
    const timestamp = message.timestamp || new Date().toISOString();
    const sender = message.sender || 'system';
    return `${sender}-${timestamp}-${index}-${Date.now()}`;
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
            <p className={styles.para}>
              {onlineUsers.has(selectedUser?._id) ? (
                <span className={styles.onlineStatus}>●</span>
              ) : null}
              @ {receiver?.email}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const uniqueId = generateUniqueId(msg, index);
            return (
              <div 
                key={uniqueId}
                data-message-id={msg.messageId || uniqueId}
                className={styles.messageWrapper}
              >
                <ChatMessage
                  sender={users[msg.sender] || msg.sender}
                  message={msg.messageContent}
                  isOwnMessage={msg.sender === userId}
                  isSystemMessage={msg.sender === "system"}
                  seen={seenMessages.has(msg.messageId)}
                  timestamp={msg.timestamp || new Date().toISOString()}
                  isOnline={onlineUsers.has(msg.sender)}
                />
              </div>
            );
          })
        ) : (
          <p>No messages yet</p>
        )}
      </div>
      <ChatForm onSendMessage={handleSendMessage} />
    </div>
  );
}