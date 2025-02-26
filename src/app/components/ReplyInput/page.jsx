"use client";
import styles from "../replyPopup/page.module.css";
import Image from "next/image";
const ReplyInput = ({ reply, setReply, session }) => {
    const defaultImage =
      "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  
    return (
      <div className={styles.commentContainer}>
        <Image
          src={session?.user?.image || defaultImage}
          width={40}
          height={40}
          alt="replyUserPicture"
        />
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Post your reply..."
        />
      </div>
    );
  };
  export default ReplyInput;
  