import { useState } from "react";
import styles from "../replyPopup/page.module.css";

const CommentsList = ({ comments }) => {
  if (!Array.isArray(comments)) {
    return <p>No comments yet.</p>;
  }

  return (
    <div>
      {comments.map((comment) => (
        <Comment key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

const Comment = ({ comment }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText, parentId: comment._id, userEmail: "user@example.com" }), // Ensure the userEmail is passed correctly
      });

      if (!res.ok) throw new Error("Failed to send reply.");

      setReplyText("");
      setShowReplyInput(false);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  return (
    <div style={{ marginLeft: 20, borderLeft: "2px solid gray", paddingLeft: 10 }}>
      <p><strong>{comment.userId.name}</strong>: {comment.postText}</p>

      <button onClick={() => setShowReplyInput(!showReplyInput)}>Reply</button>

      {showReplyInput && (
        <div>
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
          />
          <button onClick={handleReplySubmit}>Post Reply</button>
        </div>
      )}

      {/* Recursively render replies */}
      {comment.replies.length > 0 && (
        <div style={{ marginLeft: 20 }}>
          {comment.replies.map((reply) => (
            <Comment key={reply._id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsList;
