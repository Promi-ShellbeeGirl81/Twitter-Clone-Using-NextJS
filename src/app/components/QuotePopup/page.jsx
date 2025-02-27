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
import { uploadFilesToCloudinary, repostPost } from "@/utils/api/postApi";
import { fetchUserIdByEmail} from "@/utils/api/userApi";

const QuotePopup = ({ post, onClose, onQuoteSubmit }) => {
  const [reply, setReply] = useState("");
  const [selectedFile, setSelectedFile] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const [hasReposted, setHasReposted] = useState(false);
  const [userId, setUserId] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const getUserId = async () => {
      if (session?.user?.email) {
        const id = await fetchUserIdByEmail(session.user.email);
        setUserId(id);
        if (id && post.repostedBy.includes(id)) {
          setHasReposted(true);
        }
      }
    };
    getUserId();
  }, [session, post]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFile((prevFiles) => [...prevFiles, ...files]);
      const fileUrls = files.map((file) => URL.createObjectURL(file));
      setFilePreview((prevPreviews) => [...prevPreviews, ...fileUrls]);
    }
  };

  const handleRepostAction = async () => {
    if (!userId) {
      alert("User ID could not be fetched.");
      return;
    }

    const uploadedMedia = await uploadFilesToCloudinary(selectedFile);

    const response = await repostPost({
      userId,
      postId: post._id,
      isQuote: reply.trim().length > 0 || uploadedMedia.length > 0,
      quoteText: reply,
      postMedia: uploadedMedia,
    });

    if (response.error) {
      alert(response.error);
      return;
    }

    setHasReposted(response.message.includes("Undo repost successful") ? false : true);
    onQuoteSubmit(post._id);
    setReply("");
    setSelectedFile([]);
    setFilePreview([]);
    onClose();
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
