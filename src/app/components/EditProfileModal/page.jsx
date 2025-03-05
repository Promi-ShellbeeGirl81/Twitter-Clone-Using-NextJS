"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import style from "./page.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EditProfileModal({ userData, onClose }) {
  const { data: session } = useSession();
  const [userId, setUserId] = useState(userData?._id || "");
  const [name, setName] = useState(userData?.name || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    userData?.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split("T")[0] : ""
  );  
  const [location, setLocation] = useState(userData?.location || "");
  const [profilePic, setProfilePic] = useState(userData?.profilePic);
  const [coverPic, setCoverPic] = useState(userData?.coverPic);

  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({
    profile: null,
    cover: null,
  });

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setSelectedFiles((prev) => ({ ...prev, [type]: file }));

      if (type === "profile") {
        setProfilePic(fileUrl);
      } else if (type === "cover") {
        setCoverPic(fileUrl);
      }
    }
  };

  const handlePostSubmit = async () => {
    if (!session?.user?.email) {
      alert("User not authenticated");
      return;
    }

    if (!userData?._id) {
      alert("User ID not found.");
      return;
    }

    setUploading(true);
    let uploadedMedia = { profilePic, coverPic };

    try {
      const uploadPromises = Object.entries(selectedFiles).map(
        async ([type, file]) => {
          if (file) {
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
              uploadedMedia[`${type}Pic`] = data.secure_url;
            }
          }
        }
      );

      await Promise.all(uploadPromises);

      const updateResponse = await fetch(`/api/users/${userData._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          bio,
          dateOfBirth,
          location,
          profilePic: uploadedMedia.profilePic,
          coverPic: uploadedMedia.coverPic,
        }),
      });

      if (!updateResponse.ok) throw new Error("Failed to update profile");

      alert("Profile updated successfully!");
      onClose();
      setUploading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong. Please try again.");
      setUploading(false);
    }
  };
  const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";


  return (
    <div className={style.modalOverlay}>
      <div className={style.modal}>
        <button className={style.closeButton} onClick={onClose}>
          ✖
        </button>
        <h2>Edit Profile</h2>

        {/* Cover Picture Upload */}
        <div className={style.coverContainer}>
          <label className={style.imageLabel}>
            <input
              className={style.profileImageInput}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "cover")}
            />
            <img src={coverPic || defaultImage} alt="Cover" className={style.coverImage} />
          </label>
        </div>

        {/* Profile Picture Upload */}
        <div className={style.profileContainer}>
          <label className={style.imageLabel}>
            <input
              className={style.profileImageInput}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "profile")}
            />
            <img
              src={profilePic || defaultImage}
              alt="Profile"
              className={style.profileImage}
            />
          </label>
        </div>

        {/* User Info Fields */}
        <label className={style.infoLabel}>Name</label>
        <input
          className={style.profileInput}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className={style.infoLabel}>Bio</label>
        <textarea
          className={style.profileInput}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <label className={style.infoLabel}>Date of Birth</label>
        <DatePicker
          selected={dateOfBirth ? new Date(dateOfBirth) : null}
          onChange={(date) => setDateOfBirth(date.toISOString().split("T")[0])}
          dateFormat="yyyy-MM-dd"
          className={style.profileInput}
        />
        <label className={style.infoLabel}>Location</label>
        <input
          className={style.profileInput}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          autoFocus
        />

        <button
          className={style.saveButton}
          onClick={handlePostSubmit}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Save"}
        </button>
      </div>
    </div>
  );
}
