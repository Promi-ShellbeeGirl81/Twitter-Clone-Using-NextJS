"use client";
import style from "./page.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Calendar, MoreHorizontal, Search } from "lucide-react";
import EditProfileModal from "../EditProfileModal/page";
import { fetchUserIdByEmail } from "@/utils/api/userApi";
import FollowButton from "../FollowingButton/page";

export default function ProfileInfoHeader({ userId = null }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hoveringUnfollow, setHoveringUnfollow] = useState(false);
  const [fetchedUserId, setFetchedUserId] = useState(null); 

  // Redirect to home if not logged in
  useEffect(() => {
    if (!userId && status !== "loading" && !session) {
      router.push("./");
    }
  }, [session, status, router, userId]);

  // Fetch userId from session.user.email and then load the profile and follow status
  useEffect(() => {
    const fetchUserId = async (email) => {
      try {
        const userId = await fetchUserIdByEmail(email);
        setFetchedUserId(userId); 
      } catch (err) {
        console.error("Error fetching user ID:", err);
        alert("There was an issue fetching the user ID.");
      }
    };

    if (session?.user?.email) {
      fetchUserId(session.user.email);
    }
  }, [session]);

  // Fetch user data and follow status
  useEffect(() => {
    if (!fetchedUserId) return;

    const fetchUserData = async (id) => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch user data. Status: ${res.status}`);
        const data = await res.json();
        setUserData(data);

        // Fetch follow status
        const followStatusRes = await fetch(
          `/api/is-following?userId=${id}&followerId=${fetchedUserId}`
        );
        if (!followStatusRes.ok) throw new Error("Failed to fetch follow status.");
        const followStatusData = await followStatusRes.json();
        setIsFollowing(followStatusData.isFollowing);
      } catch (err) {
        console.error("Error:", err);
        alert("There was an issue fetching data.");
      }
    };

    fetchUserData(userId || fetchedUserId);
  }, [fetchedUserId, userId]);

  const handleFollowersClick=()=>{
    router.push(`/${userData._id}/followers`);
  }
  const handleFollowingClick=()=>{
    router.push(`/${userData._id}/following`);
  }

  const handleFollowToggle = async () => {
    if (!session?.user?.email) {
      return alert("You must be logged in to follow or unfollow.");
    }
    if (!fetchedUserId) {
      return alert("User ID is still loading. Please wait.");
    }
  
    try {
      const response = await fetch(isFollowing ? "/api/unfollow" : "/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [isFollowing ? "userIdToUnfollow" : "userIdToFollow"]: userData._id.toString(), 
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);

        const updatedUserResponse = await fetch(`/api/users/${userId || fetchedUserId}`);
      if (!updatedUserResponse.ok) throw new Error("Failed to fetch updated user data.");
      const updatedUserData = await updatedUserResponse.json();
      setUserData(updatedUserData);
  
        // Fetch updated follow status
        const followStatusResponse = await fetch(
          `/api/is-following?userId=${userData._id}&followerId=${fetchedUserId}`
        );
        const followStatusData = await followStatusResponse.json();
        setIsFollowing(followStatusData.isFollowing);
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
      <div className={style.loadingContainer}>
        <div className={style.spinner}>Loading...</div>
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
              <div className={style.otherIcon}><MoreHorizontal /></div>
              <div className={style.otherIcon}><Search /></div>
              {isFollowing && (
                <div className={style.otherIcon}><Bell /></div>
              )}
              <FollowButton
                isFollowing={isFollowing}
                handleFollowToggle={handleFollowToggle}
                hoveringUnfollow={hoveringUnfollow}
                setHoveringUnfollow={setHoveringUnfollow}
              />
            </div>
          )}
        </div>
        <h2>{userData.name}</h2>
        <h4>@{userData.name}</h4>
        {!isCurrentUser && <p className={style.profileBio}>{userData?.bio}</p>}
        <p className={style.profileJoinDate}>
          <Calendar size={15} /> Joined {formattedDate}
        </p>
        <div className={style.profileFollow}>
          <div className={style.profileFollowItem} onClick={handleFollowingClick}>
            <strong>{userData.following?.length || 0}</strong> <span>Following</span>
          </div>
          <div className={style.profileFollowItem} onClick={handleFollowersClick}>
            <strong>{userData.followers?.length || 0}</strong> <span>Followers</span>
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
