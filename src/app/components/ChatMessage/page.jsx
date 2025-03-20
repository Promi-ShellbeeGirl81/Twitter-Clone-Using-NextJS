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
  isLastSentMessage,
}) => {
  const effectiveSeen = seen !== undefined ? seen : Boolean(seenAt);
  console.log("Rendering message:", {
    sender,
    isOwnMessage,
    isLastSentMessage,
    effectiveSeen,
    seenAt,
  });

  return (
    <div
      className={`
        ${styles.messageContainer} 
        ${isOwnMessage ? styles.columnContainer : ""} 
        ${
          isSystemMessage
            ? styles.messageSystem
            : isOwnMessage
            ? styles.messageOwn
            : styles.messageOther
        }
      `}
    >
      <div
        className={`
          ${styles.messageBox} 
          ${
            isSystemMessage
              ? ""
              : isOwnMessage
              ? styles.messageOwnBox
              : styles.messageOtherBox
          }
        `}
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
          <span
            className={styles.timestamp}
            style={{ color: !isOwnMessage ? "black" : "inherit" }}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          {isOwnMessage && !isLastSentMessage && (
            <div className={styles.messageStatus}>
              <span
                className={`${styles.seenStatus} ${
                  effectiveSeen ? styles.seen : ""
                }`}
              >
                {effectiveSeen ? (
                  <>
                    <span className={`${styles.checkmark} ${styles.first}`}>
                      ✓
                    </span>
                    <span className={`${styles.checkmark} ${styles.second}`}>
                      ✓
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
      {isOwnMessage && isLastSentMessage && effectiveSeen && (
        <div className={styles.seenInfo}>
          {`Seen at ${new Date(seenAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}`}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
