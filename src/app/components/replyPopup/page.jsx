import { useState } from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import Header from "../Header/page";
import PostText from "../PostText/page";
import ReplyInput from "../ReplyInput/page";
import IconsSection from "../IconsSection/page";
import PostButton from "../PostButton/page";
import FileUpload from "../FileUpload/page";

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

    let uploadedMedia = [];

    try {
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

      const res = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: session.user.email,
          postText: reply,
          postMedia: uploadedMedia,
          parentId: post._id,
        }),
      });

      const responseData = await res.json();
      console.log("Response from API:", responseData);

      if (!res.ok) throw new Error("Failed to send reply.");
      onReplySubmit(post._id);

      setReply("");
      setSelectedFile([]);
      setFilePreview([]);
      onClose();
    } catch (error) {
      console.error("Error sending reply:", error);
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
          <PostButton onClick={handleReply} />
        </div>
      </div>
    </div>
  );
};


export default ReplyPopup;
