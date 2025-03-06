"use client";

import React, { useEffect, useState } from "react";
import ownstyles from "@/app/components/ProfileTab/page.module.css";
import FollowButton from "../FollowingButton/page"; 
import { useSession } from "next-auth/react";
import { fetchUserIdByEmail } from "@/utils/api/userApi";
import styles from "./page.module.css";

const UserList = ({ endpoint, title, profilePic }) => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState({});
  const [hoveringUnfollow, setHoveringUnfollow] = useState({});
  const [fetchedUserId, setFetchedUserId] = useState(null);


  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) {
        console.warn("Session email not found, skipping user ID fetch.");
        return;
      }
  
      try {
        const userId = await fetchUserIdByEmail(session.user.email);
        if (userId) {
          console.log("Fetched user ID:", userId);
          setFetchedUserId(userId);
        } else {
          console.warn("User ID fetch returned null.");
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    };
  
    fetchUserId();
  }, [session]);
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to fetch ${title.toLowerCase()} users.`);
        const data = await res.json();
        
        // Set users based on whether the list is followers or following
        const userList = title === "Followers" ? data.followers || [] : data.following || [];
        setUsers(userList);
  
        // Fetch follow status for each user
        if (fetchedUserId) {
          const followStatuses = {};
          await Promise.all(userList.map(async (user) => {
            try {
              const followStatusRes = await fetch(
                `/api/is-following?userId=${user._id}&followerId=${fetchedUserId}`
              );
              const followStatusData = await followStatusRes.json();
              followStatuses[user._id] = followStatusData.isFollowing;
            } catch (err) {
              console.error(`Error fetching follow status for user ${user._id}:`, err);
            }
          }));
  
          setIsFollowing(followStatuses); // Update follow status for all users
        }
      } catch (err) {
        console.error(`Error fetching ${title.toLowerCase()} users:`, err);
      } finally {
        setLoading(false);
      }
    };
  
    if (fetchedUserId) {
      fetchUsers();
    }
  }, [endpoint, title, fetchedUserId]);  


  const handleFollowToggle = async (userId) => {
    if (!session?.user?.email) {
      return alert("You must be logged in to follow or unfollow.");
    }
  
    try {
      const response = await fetch(isFollowing[userId] ? "/api/unfollow" : "/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [isFollowing[userId] ? "userIdToUnfollow" : "userIdToFollow"]: userId.toString(),
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
  
        // Optimistically update UI before refetching follow status
        setIsFollowing((prev) => ({
          ...prev,
          [userId]: !prev[userId], 
        }));
  
        // Fetch updated follow status
        const followStatusResponse = await fetch(
          `/api/is-following?userId=${userId}&followerId=${fetchedUserId}`
        );
        const followStatusData = await followStatusResponse.json();
        setIsFollowing((prev) => ({
          ...prev,
          [userId]: followStatusData.isFollowing,
        }));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while following/unfollowing.");
    }
  };
  
  
  const defaultImage =
  "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";


  if (loading) {
    return <div>Loading {title}...</div>;
  }

  if (users.length === 0) {
    return <div>No {title.toLowerCase()} users.</div>;
  }

  return (
    <div className={ownstyles.followingList}>
      <ul>
        {users.map((user) => (
          <li key={user._id} className={ownstyles.followingUser}>
            <div className={styles.container}>
            <div className={ownstyles.nameAndImage}>
              <img
                src={user.profilePic || defaultImage}
                alt={user.name || "User"}
                className={ownstyles.followingUserImage}
              />
              <span>{user.name}</span>
              </div>
              <div className={styles.followbn}>
              <FollowButton
                userId={user._id} 
                isFollowing={isFollowing[user._id] || false} 
                handleFollowToggle={handleFollowToggle}
                hoveringUnfollow={hoveringUnfollow[user._id] || false}
                setHoveringUnfollow={(isHovering) =>
                  setHoveringUnfollow((prev) => ({
                    ...prev,
                    [user._id]: isHovering,
                  }))
                }
              />
              </div>
            </div>
           
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
