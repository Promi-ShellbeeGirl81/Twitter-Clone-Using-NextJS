"use client";

import { useEffect, useState } from "react";
import style from "./page.module.css";
import { fetchUserLikedPosts } from "@/utils/api/userApi";

const UserLikedPosts = ({ userId }) => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserLikedPosts(userId).then((posts) => {
        setLikedPosts(posts);
        setLoading(false);
      });
    }
  }, [userId]);

  if (loading) return <p>Loading liked posts...</p>;

  return (
    <div className={style.likedPostsContainer}>
      {likedPosts.length === 0 ? (
        <p>No liked posts found.</p>
      ) : (
        likedPosts.map((post) => (
          <div key={post._id} className={style.postCard}>
            <p><strong>{post.postText}</strong></p>
            <p>❤️ {post.likeCount} </p>
          </div>
        ))
      )}
    </div>
  );
};

export default UserLikedPosts;
