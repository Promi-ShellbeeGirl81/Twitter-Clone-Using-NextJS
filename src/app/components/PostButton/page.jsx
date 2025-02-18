import styles from "./page.module.css";

const PostButton = ({ onClick, uploading }) => (
  <button
    className={styles.postbtn}
    onClick={onClick}
    disabled={uploading}
  >
    {uploading ? "Posting..." : "Post"}
  </button>
);

export default PostButton;
