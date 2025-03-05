"use client";
import style from "./page.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Calendar, MoreHorizontal, Search } from "lucide-react";
import EditProfileModal from "../EditProfileModal/page";

export default function ProfileInfoHeader({ userId = null }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hoveringUnfollow, setHoveringUnfollow] = useState(false);

  useEffect(() => {
    if (!userId && status !== "loading" && !session) {
      router.push("./");
    }
  }, [session, status, router, userId]);
  useEffect(() => {
    if (userId) {
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((err) => console.error("Error fetching user data:", err));
    } else if (session && session.user && session.user.email) {
      fetch(`/api/users/email/${session.user.email}`)
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [session, userId]);

  const handleFollowToggle = async () => {
    console.log("userdata", userData);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIdToFollow: userData._id }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Success message

        // Toggle the follow state based on current state
        setIsFollowing((prev) => !prev);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while following/unfollowing.");
    }
  };

  if (status === "loading" || !userData) {
    return (
      <div>
        <h1>Loading ...</h1>
      </div>
    );
  }
  if (!userId && !session) {
    return (
      <div>
        <h1>Please log in...</h1>
      </div>
    );
  }
  const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
  const isCurrentUser = !userId || session?.user?.email === userData.email;
  const date = new Date(userData.joinedDate);
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const formattedDate = ` ${month}, ${year}`;

  return (
    <div className={style.container}>
      <div className={style.coverPhoto}>
        <img src={userData.coverPic || defaultImage} alt="coverPic" />
      </div>
      <div className={style.profileInfo}>
        <div className={style.profileImageContainer}>
          <img
            className={style.profileImage}
            src={userData.profilePic || defaultImage}
            alt="profile"
          />
          {isCurrentUser && (
            <button
              className={style.editProfile}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </button>
          )}
          {!isCurrentUser && (
            <div className={style.otherIcons}>
              <div className={style.otherIcon}><MoreHorizontal/></div>
              <div className={style.otherIcon}><Search/></div>
              {isFollowing && (
                 <div className={style.otherIcon}><Bell/></div>
              )}
              <button
                className={`${style.followProfile} ${
                  isFollowing
                    ? hoveringUnfollow
                      ? style.unfollow 
                      : style.following 
                    : style.follow 
                }`}
                onClick={handleFollowToggle}
                onMouseEnter={() => isFollowing && setHoveringUnfollow(true)}
                onMouseLeave={() => setHoveringUnfollow(false)}
              >
                {isFollowing ? (hoveringUnfollow ? "Unfollow" : "Following") : "Follow"}
              </button>
              </div>
          )}
        </div>
        <h2>{userData.name}</h2>
        <h4>@{userData.name}</h4>
        {!isCurrentUser && (
           <p className={style.profileBio}>
            {userData?.bio}
         </p>
        )}
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
