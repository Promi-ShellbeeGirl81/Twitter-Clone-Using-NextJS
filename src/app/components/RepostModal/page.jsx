"use client";

import { Repeat, Quote } from "lucide-react";
import styles from "./page.module.css"; 

const RepostModal = ({ modalPosition = { top: 0, left: 0 }, onClose, onRepost, isReposted, onQuote }) => {
  if (!modalPosition) return null; // Prevent error if modalPosition is undefined

  return (
    <div
      className={styles.modal}
      style={{ 
        top: `${modalPosition?.top ?? 0}px`, 
        left: `${modalPosition?.left ?? 0}px`
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className={styles.modalButton} onClick={onRepost}>
        <Repeat size={15} /> {isReposted ? "Undo repost" : "Repost"}
      </div>
      <div className={styles.modalButton} onClick={onQuote}>
        <Quote size={15} /> Quote
      </div>
    </div>
  );
};

export default RepostModal;
