"use client";

import { useEffect, useState } from "react";
import ChatForm from "@/app/components/ChatForm/page";
import ChatMessage from "@/app/components/ChatMessage/page";
import { socket } from "@/lib/socketClient";
import styles from "./page.module.css";  

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.on("message", (data) => {
      console.log("Message received:", data);
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (message) => {
      if (!message.includes(username)) {
        console.log(message);
        setMessages((prev) => [...prev, { sender: "system", message }]);
      }
    });

    return () => {
      socket.off("user_joined");
      socket.off("message");
    };
  }, [username]);

  const handleSendMessage = (message) => {
    const data = { room, message, sender: username };
    console.log("Sending message:", data);
    socket.emit("message", data);
  };

  const handleJoinRoom = () => {
    if (room && username) {
      socket.emit("join-room", { room, username: username });
      setJoined(true);
    }
  };

  return (
    <div className={styles.container}>
      {!joined ? (
        <div className={styles.formContainer}>
          <h1 className={styles.heading}>Join a room</h1>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.inputField}
          />
          <input
            type="text"
            placeholder="Enter Room Name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className={styles.inputField}
          />
          <button
            onClick={handleJoinRoom}
            className={styles.button}
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className={styles.roomContainer}>
          <h1 className={styles.roomHeading}>Room {room}</h1>
          <div className={styles.messagesContainer}>
            {messages.map((msg, index) => {
              if (!msg.message.trim()) return null;
              console.log("Rendering message:", msg);
              return (
                <ChatMessage
                  key={index}
                  sender={msg.sender}
                  message={msg.message}
                  isOwnMessage={msg.sender === username}
                />
              );
            })}
          </div>
          <ChatForm onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
}
