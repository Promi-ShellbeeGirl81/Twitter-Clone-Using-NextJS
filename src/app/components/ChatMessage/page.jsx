"use client";
import React from "react";
import styles from "./page.module.css";

const ChatMessage = ({
  sender,
  message,
  isOwnMessage,
  isSystemMessage,
  seen,
  timestamp,
  seenAt,
  isOnline,
}) => {
  return (
    <div
      className={`${styles.messageContainer} ${
        isSystemMessage
          ? styles.messageSystem
          : isOwnMessage
          ? styles.messageOwn
          : styles.messageOther
      }`}
    >
      <div
        className={`${styles.messageBox} ${
          isSystemMessage
            ? ""
            : isOwnMessage
            ? styles.messageOwnBox
            : styles.messageOtherBox
        }`}
      >
        {!isSystemMessage && (
          <div className={styles.messageHeader}>
            <span className={styles.sender}>{sender}</span>
            {!isOwnMessage && (
              <span
                className={`${styles.onlineStatus} ${
                  isOnline ? styles.online : ""
                }`}
              >
                ●
              </span>
            )}
          </div>
        )}
        <p className={styles.message}>{message}</p>
        <div className={styles.messageFooter}>
          <span className={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          {isOwnMessage && (
            <div className={styles.messageStatus}>
              <span
                className={`${styles.seenStatus} ${seen ? styles.seen : ""}`}
              >
                {seen ? (
                  <>
                    <span className={`${styles.checkmark} ${styles.first}`}>
                      ✓
                    </span>
                    <span className={`${styles.checkmark} ${styles.second}`}>
                      ✓
                    </span>
                    <span className={styles.seenAt}>
                      {seen && seenAt
                        ? `Seen at ${new Date(seenAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}`
                        : ""}
                    </span>
                  </>
                ) : (
                  <span className={styles.checkmark}>✓</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
