"use client"; 

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";

const FileUpload = ({ filePreview = [], selectedFile = [], onFileChange }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; 
  const displayedFiles = filePreview.slice(0, 4);
  const additionalFilesCount = Math.max(0, filePreview.length - 4);

  return (
    <div className={styles.filePreview}>
      <input
        id="fileUploadInput"
        type="file"
        accept="image/*, video/*"
        onChange={onFileChange}
        style={{ display: "none" }}
        multiple
      />
      {filePreview.length > 0 && (
        <div className={styles.imageGrid}>
          {displayedFiles.map((filePreviewSingle, index) => {
            const file = selectedFile[index];

            if (file?.type?.startsWith("image/")) {
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
            }

            if (file?.type?.startsWith("video/")) {
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
      )}
      {additionalFilesCount > 0 && (
        <div className={styles.previewItem}>
          <span className={styles.moreImages}>+{additionalFilesCount}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
