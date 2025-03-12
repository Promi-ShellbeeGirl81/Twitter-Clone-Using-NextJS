"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socketClient"; 
import ChatForm from "@/app/components/ChatForm/page";
import ChatMessage from "@/app/components/ChatMessage/page";
import { fetchUserIdByEmail, fetchUserById } from "@/utils/api/userApi";
import styles from "./page.module.css";

export default function ChatRoom() {
  const { senderId, receiverId } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [userId, setUserId] = useState(null);
  const [users, setUsers] = useState({});
  const [roomId, setRoomId] = useState("");

  // Get the current user's ID by email
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
    if (!receiverId) return;
    const fetchReceiver = async () => {
      try {
        const res = await fetch(`/api/users/${receiverId}`);
        const data = await res.json();
        if (res.ok) {
          setReceiver(data);
          setUsers((prev) => ({ ...prev, [receiverId]: data.name }));
        } else {
          console.error("Error fetching receiver:", data.message);
        }
      } catch (error) {
        console.error("Error fetching receiver:", error);
      }
    };
    fetchReceiver();
  }, [receiverId]);

  // Fetch chat history
  useEffect(() => {
    if (!senderId || !receiverId) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/messages?sender=${senderId}&receiver=${receiverId}`
        );
        const data = await res.json();
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
  }, [senderId, receiverId]);

  // Room ID generation and socket handling
  useEffect(() => {
    if (!userId || !receiverId) return;
    const roomId = [userId, receiverId].sort().join("_");
    setRoomId(roomId);
    console.log("Calculated roomId:", roomId);

    const handleSocketConnect = () => {
      console.log("Socket connected, emitting join-room:", roomId);
      socket.emit("join-room", { room: roomId, username: userId });
      console.log("Socket ID:", socket.id);
    };

    const handleIncomingMessage = (data) => {
      if (data.sender !== userId) {
        console.log("Received message:", data);
        setMessages((prev) => [...prev, { ...data, messageContent: data.message }]);
        fetchUserDetails(data.sender);
      }
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
  }, [userId, receiverId]);

  // Listen for user-joined event
  useEffect(() => {
    if (!userId || !receiverId) return;
    const handleUserJoined = (message) => {
      console.log("User joined:", message);
      setMessages((prev) => [
        ...prev,
        { sender: "system", messageContent: message }
      ]);
    };
    socket.on("user_joined", handleUserJoined);
    return () => {
      socket.off("user_joined", handleUserJoined);
    };
  }, [userId, receiverId]);

  // Fetch both sender and receiver details
  useEffect(() => {
    if (!senderId || !receiverId) return;
    const fetchUsersDetails = async () => {
      try {
        const senderDetails = await fetchUserById(senderId);
        const receiverDetails = await fetchUserById(receiverId);
        setUsers({
          [senderId]: senderDetails.name,
          [receiverId]: receiverDetails.name,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsersDetails();
  }, [senderId, receiverId]);

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
      receiver: receiverId,
      messageType: "text",
    };
    console.log("Sending message:", messageData, roomId);
    socket.emit("message", { room: roomId, message: messageData.messageContent, sender: userId });
    setMessages((prev) => [...prev, { ...messageData, sender: userId }]);
    createNewMessage(messageData);
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
        return;
      }
      const message = await res.json();
      await fetchUserDetails(message.sender);
    } catch (error) {
      console.error("Error creating message:", error);
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

  return (
    <div className={styles.container}>
      <h1 className={styles.roomHeading}>Chat with {receiver?.name}</h1>
      <div className={styles.messagesContainer}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              sender={users[msg.sender] || msg.sender}
              message={msg.messageContent}
              isOwnMessage={msg.sender === userId}
              isSystemMessage={msg.sender === "system"}
            />
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </div>
      <ChatForm onSendMessage={handleSendMessage} />
    </div>
  );
}