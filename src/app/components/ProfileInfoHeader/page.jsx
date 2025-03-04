"use client";
import Image from "next/image";
import style from "./page.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import EditProfileModal from "../EditProfileModal/page";

export default function ProfileInfoHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("./");
    }
  }, [session, status, router]);
  useEffect(() => {
    if (session && session.user && session.user.email) {
      fetch(`/api/users/email/${session.user.email}`)
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [session]);

  if (status === "loading" || !userData) {
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
  const date = new Date(userData.joinedDate);
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const formattedDate = ` ${month}, ${year}`;
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  return (
    <div className={style.container}>
      <div className={style.coverPhoto}>
        <Image src={userData.coverPic} alt="coverPic" width={600} height={30} />
      </div>
      <div className={style.profileInfo}>
        <div className={style.profileImageContainer}>
          <Image
            className={style.profileImage}
            src={defaultImage}
            alt="profile"
            width={60}
            height={60}
          />
          <button
            className={style.editProfile}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>
        <h2>{userData.name}</h2>
        <h4>@{userData.name}</h4>
        <p className={style.profileJoinDate}>
          <Calendar size={15} /> Joined {formattedDate}
        </p>
        <div className={style.profileFollow}>
          <div className={style.profileFollowItem}>
            <strong>{userData.following}</strong> <span>Following</span>
          </div>
          <div className={style.profileFollowItem}>
            {" "}
            <strong>{userData.follower} </strong> <span>Followers</span>
          </div>
        </div>
      </div>
      {isEditModalOpen && (
        <EditProfileModal
          userData={userData}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
