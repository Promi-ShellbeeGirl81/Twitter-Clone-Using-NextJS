"use client";
import React, { useState } from "react";
import styles from "./page.module.css";
import { FileVideo, Image, Send, Smile } from "lucide-react";

const ChatForm = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.icon}>
        <Image size={22} color="blue" />
      </div>
      <div className={styles.icon}>
        <FileVideo size={22} color="blue" />
      </div>
      <div className={styles.icon}>
        <Smile size={22} color="blue" />
      </div>
      <input
        type="text"
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
        className={styles.input}
        placeholder="Start a new message here"
      />
      <button type="submit" className={styles.button}>
        <Send size={22} color="blue" />
      </button>
    </form>
  );
};

export default ChatForm;
