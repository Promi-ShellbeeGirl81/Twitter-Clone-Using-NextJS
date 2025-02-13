"use client";
import Image from "next/image";
import {
  FileImage,
  Image as LucideImage,
  Smile,
  MapPin,
  Globe,
  AlarmClock,
  Flame,
} from "lucide-react";
import styles from "./page.module.css";
import { FaPoll } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  console.log(session);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFile((prevFiles) => [...prevFiles, ...files]);
      const fileUrls = files.map((file) => URL.createObjectURL(file));
      setFilePreview((prevPreviews) => [...prevPreviews, ...fileUrls]);
  
      console.log("Files selected:", files);  
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
      // Step 1: Find user by email
      const res = await fetch(`/api/users/email/${session?.user?.email}`);
      const user = await res.json();
      if (!user || !user._id) throw new Error("User not found");
  
      const userId = user._id;
  
      // Step 2: Upload files to Cloudinary if files exist
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
          console.log("Cloudinary response:", data);  // Log Cloudinary response
  
          if (data.secure_url) {
            uploadedMedia.push(data.secure_url);
          }
        }
      }
  
      // Step 3: Send post request
      console.log("Sending post request with media:", { userId, postText, postMedia: uploadedMedia });
  
      const postResponse = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          postText: postText.trim(),
          postMedia: uploadedMedia,
        }),
      });
  
      if (!postResponse.ok) throw new Error("Failed to post");
  
      // Reset state after successful post
      setPostText("");
      setSelectedFile([]);
      setFilePreview([]);
      setUploading(false);
    } catch (error) {
      console.log("Error posting:", error);
      setUploading(false);
    }
  };  
  const displayedFiles = filePreview.slice(0, 4);
  const additionalFilesCount = filePreview.length - 4;

  return (
    <div className={`${styles.container} ${isActive ? styles.active : ""}`}>
      <div className={styles.mainContainer}>
        {session?.user?.image && (
          <Image src={session.user.image} width={40} height={40} alt="propic" />
        )}
        <div className={styles.textContainer}>
          <input
            type="text"
            placeholder="What is happening?!"
            onFocus={() => setIsActive(true)}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          <input
            id="fileUploadInput"
            type="file"
            accept="image/*, video/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            multiple
          />
          {filePreview.length > 0 && (
            <div className={styles.filePreview}>
              <div className={styles.imageGrid}>
                {displayedFiles.map((filePreviewSingle, index) => {
                  const file = selectedFile[index];
                  if (file && file.type.startsWith("image/")) {
                    return (
                      <div key={index} className={styles.previewItem}>
                        <Image
                          src={filePreviewSingle}
                          alt={`Selected image ${index}`}
                          width={100}
                          height={100}
                          className={styles.previewImage}
                        />
                      </div>
                    );
                  } else if (file && file.type.startsWith("video/")) {
                    return (
                      <div key={index} className={styles.previewItem}>
                        <video controls width={100}>
                          <source src={filePreviewSingle} type={file.type} />
                        </video>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              {additionalFilesCount > 0 && (
                <div className={styles.previewItem}>
                  <span className={styles.moreImages}>
                    {" "}
                    +{additionalFilesCount}
                  </span>
                </div>
              )}
              {isActive && (
                <p className={styles.paragraph}>
                  <Globe size={15} />{" "}
                  <span className={styles.paratext}>Everyone can reply</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.postbottom} ${isActive ? styles.visible : ""}`}>
        <div className={styles.posticonSection}>
          <div className={styles.posticon}>
            <LucideImage
              size={18}
              onClick={() => document.getElementById("fileUploadInput").click()}
            />
          </div>
          <div className={styles.posticon}>
            <FileImage size={18} />
          </div>
          <div className={styles.posticon}>
            <Flame size={18} />
          </div>
          <div className={styles.posticon}>
            <FaPoll size={18} />
          </div>
          <div className={styles.posticon}>
            <Smile size={18} />
          </div>
          <div className={styles.posticon}>
            <AlarmClock size={18} />
          </div>
          <div className={styles.posticon}>
            <MapPin size={18} />
          </div>
        </div>
        <button
          className={styles.postbtn}
          onClick={handlePostSubmit}
          disabled={uploading}
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

export default StatusUpdate;
