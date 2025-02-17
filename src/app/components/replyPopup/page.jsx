import { useState } from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import Header from "../Header/page";
import PostText from "../PostText/page";
import ReplyInput from "../ReplyInput/page";
import IconsSection from "../IconsSection/page";
import PostButton from "../PostButton/page";

const ReplyPopup = ({ post, onClose }) => {
  const [reply, setReply] = useState("");
  const { data: session } = useSession();

  const handleReply = async () => {
    if (!reply.trim()) return;
  
    try {
      const res = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,  
          postText: reply,                
          postMedia: [],                 
          parentId: post._id,            
        }),
      });
  
      if (!res.ok) throw new Error("Failed to send reply.");
  
      setReply("");  
      onClose();     
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };  
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
        <Header post={post} />
        <PostText post={post} />
        <ReplyInput reply={reply} setReply={setReply} session={session} />
        <IconsSection />
        <div className={styles.postbottom}>
          <PostButton handleReply={handleReply} />
        </div>
      </div>
    </div>
  );
};

export default ReplyPopup;
