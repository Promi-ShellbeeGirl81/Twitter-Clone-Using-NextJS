"use client";
import { useEffect, useState } from "react";
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
      setMessages((prev) => [
        ...prev,
        { ...data, messageContent: data.message },
      ]);
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
    };
    console.log("Sending message:", messageData, roomId);
    socket.emit("message", {
      room: roomId,
      message: messageData.messageContent,
      sender: userId,
      receiver: receiver._id, // Use receiver._id instead of receiverId
    });
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
      <div className={styles.roomHeading}>
        <img
          className={styles.img}
          src={receiver?.profilePic || defaultImage}
        />
        <h1>{receiver?.name}</h1>
        <p className={styles.para}>@ {receiver?.email}</p>
        <p className={styles.para}>
          Joined{" "}
          {new Date(receiver?.joinedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
          <span>.</span> {receiver?.followers.length} Followers
        </p>
      </div>
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