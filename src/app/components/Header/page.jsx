import { formatDistanceToNow } from "date-fns";
import styles from "../replyPopup/page.module.css";
import Image from "next/image";
const Header = ({ post }) => {
    const createdAtDate = new Date(post.createdAt);
    const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
  
    const defaultImage =
      "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  
    return (
      <div className={styles.header}>
        <Image
          src={(post.userImage || defaultImage).trim()}
          width={32}
          height={32}
          alt="user profile"
          className={styles.userImage}
        />
        <div className={styles.headerText}>
          <h3>{post.userName}</h3>
          <p>@{post.userName}</p>
          <p>{timeAgo}</p>
        </div>
      </div>
    );
  };
  export default Header;  