"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import Header from "../Header/page";
import PostText from "../PostText/page";
import ReplyInput from "../ReplyInput/page";
import IconsSection from "../IconsSection/page";
import PostButton from "../PostButton/page";
import FileUpload from "../FileUpload/page";

const QuotePopup = ({ post, onClose, onQuoteSubmit }) => {
  const [reply, setReply] = useState("");
  const [selectedFile, setSelectedFile] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [hasReposted, setHasReposted] = useState(false);
  const [userId, setUserId] = useState(null); // 🔑 Store user ID
  const { data: session } = useSession();

  // ✅ Fetch user ID from email when session loads
  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/users/email/${session.user.email}`);
          const data = await response.json();
          if (!response.ok || !data._id) {
            throw new Error("User ID not found.");
          }
          setUserId(data._id);

          // ✅ Check if the user has already reposted
          if (post.repostedBy.includes(data._id)) {
            setHasReposted(true);
          }
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }
    };

    fetchUserId();
  }, [session, post]);

  // ✅ File upload handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFile((prevFiles) => [...prevFiles, ...files]);
      const fileUrls = files.map((file) => URL.createObjectURL(file));
      setFilePreview((prevPreviews) => [...prevPreviews, ...fileUrls]);
    }
  };

  // ✅ Handle repost/quote submission
  // ✅ Handle repost/quote submission
const handleRepostAction = async () => {
  try {
    if (!userId) {
      alert("User ID could not be fetched.");
      return;
    }

    let uploadedMedia = [];

    // ✅ Upload media if present
    if (selectedFile.length > 0) {
      for (let file of selectedFile) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          { method: "POST", body: formData }
        );

        const data = await uploadRes.json();
        if (data.secure_url) {
          uploadedMedia.push(data.secure_url);
        }
      }
    }

    // ✅ Send repost/quote request to backend
    const res = await fetch(`/api/posts/repost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        postId: post._id,
        isQuote: reply.trim().length > 0 || uploadedMedia.length > 0,
        quoteText: reply,
        postMedia: uploadedMedia,
      }),
    });

    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.error || "Repost action failed.");

    // ✅ Update repost state
    if (responseData.message.includes("Undo repost successful")) {
      setHasReposted(false);
    } else {
      setHasReposted(true);
    }

    // ✅ Reset form and close popup
    onQuoteSubmit(post._id);
    setReply("");
    setSelectedFile([]);
    setFilePreview([]);
    onClose();
  } catch (error) {
    console.error("Repost Action Error:", error);
    alert("Failed to perform repost action. Please try again.");
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
        <div className={styles.textContainer}>
          <ReplyInput reply={reply} setReply={setReply} session={session} />
          <FileUpload
            filePreview={filePreview}
            selectedFile={selectedFile}
            onFileChange={handleFileUpload}
          />
        </div>
        <div className={styles.postbottom}>
          <IconsSection />
          <PostButton
            onClick={handleRepostAction}
            disabled={false}
            buttonText={hasReposted ? "Undo Repost" : "Repost"}
          />
        </div>
      </div>
    </div>
  );
};

export default QuotePopup;
