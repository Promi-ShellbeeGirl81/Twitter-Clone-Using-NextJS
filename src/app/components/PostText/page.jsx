import styles from "./page.module.css";

const PostText = ({ post }) => {
  if (!post) return <p>Loading...</p>; // Handle undefined post gracefully

  return (
    <div>
      <p className={styles.postText}>{post?.postText || "No text available"}</p>
      <div className={styles.postSmallTextSection}>
        <p className={styles.postTextSmall}>{post?.postMedia?.join(", ") || "No media"}</p>
        <p className={styles.postTextSmall}>
          Replying to <span>@{post?.userId?.name || "Unknown"}</span>
        </p>
      </div>
    </div>
  );
};

export default PostText;
