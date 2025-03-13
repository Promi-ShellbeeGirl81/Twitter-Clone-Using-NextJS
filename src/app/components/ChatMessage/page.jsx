"use client";
import React from "react";
import styles from "./page.module.css";

const ChatMessage = ({ sender, message, isOwnMessage, isSystemMessage }) => {
  return (
    <div
      className={`${styles.messageContainer} ${
        isSystemMessage ? styles.messageSystem : isOwnMessage ? styles.messageOwn : styles.messageOther
      }`}
    >
      <div
        className={`${styles.messageBox} ${
          isSystemMessage ? "" : isOwnMessage ? styles.messageOwnBox : styles.messageOtherBox
        }`}
      >
        {!isSystemMessage && <p className={styles.sender}>{sender}</p>}
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
