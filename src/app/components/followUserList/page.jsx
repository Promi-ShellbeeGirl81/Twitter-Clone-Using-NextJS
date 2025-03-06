"use client";

import React, { useEffect, useState } from "react";
import ownstyles from "@/app/components/ProfileTab/page.module.css";
import FollowButton from "../FollowingButton/page"; 
import { useSession } from "next-auth/react";

const UserList = ({ endpoint, title, profilePic }) => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState({});
  const [hoveringUnfollow, setHoveringUnfollow] = useState({});
  const [fetchedUserId, setFetchedUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched data:", data);
          if (title === "Followers") {
            setUsers(data.followers || []);
          } else if (title === "Following") {
            setUsers(data.following || []);
          }
        } else {
          console.error(`Failed to fetch ${title.toLowerCase()} users.`);
        }
      } catch (err) {
        console.error(`Error fetching ${title.toLowerCase()} users:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [endpoint, title]);


  const handleFollowToggle = async (userId) => {
    if (!session?.user?.email) {
      return alert("You must be logged in to follow or unfollow.");
    }
    if (!fetchedUserId) {
      return alert("User ID is still loading. Please wait.");
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

        setIsFollowing((prev) => ({
          ...prev,
          [userId]: !prev[userId], 
        }));

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
            <div className={ownstyles.nameAndImage}>
              <img
                src={profilePic || "https://via.placeholder.com/50"}
                alt={user.name || "User"}
                className={ownstyles.followingUserImage}
              />
              <span>{user.name}</span>
              <FollowButton
                userId={user._id} // Pass user._id to FollowButton
                isFollowing={isFollowing[user._id] || false} // Track follow status per user
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
