import { formatDistanceToNow } from "date-fns";
import styles from "./page.module.css";
import Image from "next/image";

const Header = ({ post = {} }) => {
  const createdAtDate = post?.createdAt ? new Date(post.createdAt) : null;
  const timeAgo = createdAtDate ? formatDistanceToNow(createdAtDate, { addSuffix: true }) : "Unknown time";

  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  return (
    <div className={styles.header}>
      <Image
        src={(post?.userId?.userImage || defaultImage).trim()}
        width={32}
        height={32}
        alt="user profile"
        className={styles.userImage}
      />
      <div className={styles.headerText}>
        <h3>{post?.userId?.name || "Unknown User"}</h3>
        <p>@{post?.userId?.name || "unknown"}</p>
        <p>{timeAgo}</p>
      </div>
    </div>
  );
};

export default Header;
