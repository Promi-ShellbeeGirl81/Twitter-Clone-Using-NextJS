import styles from "./page.module.css";

const PostText = ({ post }) => {
  return (
    <div>
      <p className={styles.postText}>{post.postText}</p>
      <div className={styles.postSmallTextSection}>
      <p className={styles.postTextSmall}>{post.postMedia}</p>
      <p className={styles.postTextSmall}>Replying to <span>@{post.userId.name}</span></p>
      </div>
    </div>
  );
};
export default PostText;
