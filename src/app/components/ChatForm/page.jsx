"use client";
import React, { useState } from "react";
import styles from "./page.module.css";  

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
      <input
        type="text"
        onChange={(e) => setMessage(e.target.value)}
        className={styles.input}
        placeholder="Type your message here..."
      />
      <button type="submit" className={styles.button}>
        Send
      </button>
    </form>
  );
};

export default ChatForm;
