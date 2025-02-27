"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUpload from "../FileUpload/page";
import IconsSection from "../IconsSection/page";
import PostButton from "../PostButton/page";
import UserProfileImage from "../UserProfileImage/page";
import styles from "./page.module.css";

function StatusUpdate() {
  const { data: session, status } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [postText, setPostText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState([]);
  const [filePreview, setFilePreview] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("./");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div>
        <h1>Loading ...</h1>
      </div>
    );
  }
  if (!session) {
    return (
      <div>
        <h1>Please log in...</h1>
      </div>
    );
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFile((prevFiles) => [...prevFiles, ...files]);
      const fileUrls = files.map((file) => URL.createObjectURL(file));
      setFilePreview((prevPreviews) => [...prevPreviews, ...fileUrls]);
    }
  };

  const handlePostSubmit = async () => {
    if (!postText.trim() && selectedFile.length === 0) {
      alert("Post can't be empty");
      return;
    }

    setUploading(true);
    let uploadedMedia = [];

    try {
      const res = await fetch(`/api/users/email/${session?.user?.email}`);
      const user = await res.json();
      if (!user || !user._id) throw new Error("User not found");

      const userEmail = session?.user?.email;

      if (selectedFile.length > 0) {
        for (let file of selectedFile) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          );

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

      const postResponse = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          postText: postText.trim(),
          postMedia: uploadedMedia,
        }),
      });

      if (!postResponse.ok) throw new Error("Failed to post");

      setPostText("");
      setSelectedFile([]);
      setFilePreview([]);
      setUploading(false);
    } catch (error) {
      console.log("Error posting:", error);
      setUploading(false);
    }
  };

  return (
    <div className={`${styles.container} ${isActive ? styles.active : ""}`}>
      <div className={styles.mainContainer}>
        <UserProfileImage imageUrl={session?.user?.image} />
        <div className={styles.textContainer}>
          <input
            type="text"
            placeholder="What is happening?!"
            onFocus={() => setIsActive(true)}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          <FileUpload
            filePreview={filePreview}
            selectedFile={selectedFile}
            onFileChange={handleFileUpload}
          />
        </div>
      </div>
      <div className={`${styles.postbottom} ${isActive ? styles.visible : ""}`}>
        <IconsSection />
        <PostButton onClick={handlePostSubmit} uploading={uploading} />
      </div>
    </div>
  );
}

export default StatusUpdate;
