import styles from "./page.module.css";
const PostText = ({ post }) => {
    return <p className={styles.postText}>{post.postText}</p>;
  };
  export default PostText;