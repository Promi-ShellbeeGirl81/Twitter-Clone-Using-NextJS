"use client";

import React from "react";
import style from "@/app/components/ProfileInfoHeader/page.module.css";

const FollowButton = ({
  userId,
  isFollowing,
  handleFollowToggle,
  hoveringUnfollow,
  setHoveringUnfollow,
}) => {
  return (
    <button
      className={`${style.followProfile} ${
        isFollowing
          ? hoveringUnfollow
            ? style.unfollow
            : style.following
          : style.follow
      }`}
      onClick={() => handleFollowToggle(userId)} 
      onMouseEnter={() => isFollowing && setHoveringUnfollow(true)}
      onMouseLeave={() => setHoveringUnfollow(false)}
    >
      {isFollowing
        ? hoveringUnfollow
          ? "Unfollow"
          : "Following"
        : "Follow"}
    </button>
  );
};

export default FollowButton;
