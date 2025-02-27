"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import Header from "../Header/page";
import PostText from "../PostText/page";
import ReplyInput from "../ReplyInput/page";
import IconsSection from "../IconsSection/page";
import PostButton from "../PostButton/page";
import FileUpload from "../FileUpload/page";
import { uploadFilesToCloudinary, sendReply} from "@/utils/api/postApi";

const ReplyPopup = ({ post, onClose, onReplySubmit }) => {
  const [reply, setReply] = useState("");
  const [selectedFile, setSelectedFile] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const { data: session } = useSession();

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    console.log("Selected files:", files);

    if (files.length > 0) {
      setSelectedFile((prevFiles) => [...prevFiles, ...files]);
      const fileUrls = files.map((file) => URL.createObjectURL(file));
      console.log("Generated file URLs:", fileUrls);
      setFilePreview((prevPreviews) => [...prevPreviews, ...fileUrls]);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() && selectedFile.length === 0) return;

    console.log("Sending reply...");

    const uploadedMedia = await uploadFilesToCloudinary(selectedFile);

    const response = await sendReply({
      userEmail: session.user.email,
      postText: reply,
      postMedia: uploadedMedia,
      parentId: post._id,
    });

    if (response.error) {
      alert(response.error);
      return;
    }

    onReplySubmit(post._id);
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
          <PostButton onClick={handleReply} />
        </div>
      </div>
    </div>
  );
};

export default ReplyPopup;
