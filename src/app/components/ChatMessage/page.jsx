"use client";
import React from 'react';
import styles from './page.module.css'; // Import CSS module

const ChatMessage = ({ sender, message, isOwnMessage }) => {
  const isSystemMessage = sender === "system";

  return (
    <div className={`${styles.messageContainer} ${isSystemMessage ? styles.messageSystem : isOwnMessage ? styles.messageOwn : styles.messageOther}`}>
      <div 
        className={`${styles.messageBox} ${isSystemMessage ? styles.messageSystemBox : isOwnMessage ? styles.messageOwnBox : styles.messageOtherBox}`}
      >
        {!isSystemMessage && (
          <p className={styles.sender}>{sender}</p>
        )}
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
