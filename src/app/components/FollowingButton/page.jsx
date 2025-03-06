"use client";

import React from "react";
import style from "./page.module.css";
import btnstyle from "@/app/components/ProfileInfoHeader/page.module.css";

const FollowButton = ({
  userId,
  isFollowing,
  handleFollowToggle,
  hoveringUnfollow,
  setHoveringUnfollow,
}) => {
  return (
    <div className={btnstyle.profileInfo}>
    <button
      onClick={() => handleFollowToggle(userId)} 
      onMouseEnter={() => setHoveringUnfollow(true)}
      onMouseLeave={() => setHoveringUnfollow(false)}
      className={`${style.followProfile} ${
        isFollowing
          ? hoveringUnfollow
            ? style.unfollow 
            : style.following 
          : style.follow 
      }`}
    >
      {isFollowing ? (hoveringUnfollow ? "Unfollow" : "Following") : "Follow"}
    </button>
    </div>
  );
};

export default FollowButton;
