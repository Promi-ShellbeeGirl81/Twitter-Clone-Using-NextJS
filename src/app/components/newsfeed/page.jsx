"use client";

import {
  MessageCircle,
  Repeat,
  Heart,
  Eye,
  Bookmark,
  Share,
} from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import ReplyPopup from "../replyPopup/page"; // Import the ReplyPopup component

const NewsFeed = () => {
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [replyPopupVisible, setReplyPopupVisible] = useState(false); // Manage reply popup visibility
  const [selectedPost, setSelectedPost] = useState(null); // Track selected post for reply
  const router = useRouter(); // Initialize router for navigation

  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  /** Fetch user ID */
  const fetchUserId = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch(`/api/users/email/${session.user.email}`);
      if (!res.ok) throw new Error("Failed to fetch user ID.");
      const userData = await res.json();
      if (!userData._id) throw new Error("User ID missing.");
      setUserId(userData._id);
      fetchPostAndUsers(userData._id);
    } catch (error) {
      console.error(error);
    }
  }, [session]);

  const fetchPostAndUsers = async (userId) => {
    try {
      const postRes = await fetch(`/api/posts`); // Fetch posts
      if (!postRes.ok) throw new Error("Failed to fetch posts.");
      
      const postData = await postRes.json();

      // Attach user data to posts directly
      const postsWithUsers = postData.map(post => {
        return {
          ...post,
          userName: post.userId?.name || "Unknown",
          userAvatar: post.userId?.avatar?.trim() || defaultImage,
        };
      });

      // Map liked posts (optional feature)
      const userLikedPosts = postData.reduce((acc, post) => {
        acc[post._id] = post.likedBy?.includes(userId) || false;
        return acc;
      }, {});

      setPosts(postsWithUsers);
      setLikedPosts(userLikedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setError("Error fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeClick = async (postId) => {
    if (!userId) return; // Only allow liking if the user is authenticated

    const updatedLikedPosts = { ...likedPosts, [postId]: !likedPosts[postId] };
    setLikedPosts(updatedLikedPosts);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update like status.");
      // Optionally handle response data (e.g., new like count)
    } catch (error) {
      console.error(error);
      setLikedPosts(likedPosts); // Reset like state if error occurs
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchUserId();
  }, [status, fetchUserId]);

  const handlePostClick = (postId) => {
    router.push(`/post/${postId}`); // Navigate to post detail
  };

  const handleReplyClick = (event, post) => {
    event.stopPropagation(); // Prevent the post click from firing
    setSelectedPost(post); // Set the selected post for replying
    setReplyPopupVisible(true); // Show the reply popup
  };

  const closeReplyPopup = () => {
    setReplyPopupVisible(false); // Close the reply popup
    setSelectedPost(null); // Clear the selected post
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts
          .filter((post) => post.parentId === null) // Filter posts to show only root posts
          .map((post) => {
            const {
              _id,
              postText,
              postMedia = [],
              replyCount = 0,
              repostCount = 0,
              likeCount = 0,
              viewCount = 0,
              userName,
              userAvatar,
            } = post;

            const isLiked = likedPosts[_id];

            return (
              <div
                key={_id}
                className={styles.post}
                onClick={() => handlePostClick(_id)} // Navigate to post detail
              >
                <div className={styles.userInfo}>
                  <Image
                    src={userAvatar}
                    width={35}
                    height={32}
                    alt="User profile"
                    className={styles.userImage}
                  />
                  <div className={styles.userNames}>
                    <h3>{userName}</h3>
                    <h5>@{userName}</h5>
                  </div>
                </div>

                {postText && <p className={styles.postText}>{postText}</p>}

                {postMedia.length > 0 && (
                  <div className={styles.postMedia}>
                    {postMedia.slice(0, 4).map((media, index) => (
                      <div key={index}>
                        {media.endsWith(".mp4") ? (
                          <video width="100%" controls>
                            <source src={media} type="video/mp4" />
                          </video>
                        ) : (
                          <Image
                            src={media}
                            width={600}
                            height={300}
                            alt={`Post content ${index + 1}`}
                            className={styles.postImage}
                          />
                        )}
                      </div>
                    ))}
                    {postMedia.length > 4 && (
                      <div className={styles.extraMedia}>
                        +{postMedia.length - 4} more
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.engagement}>
                  <div className={styles.engagement1}>
                    <span className={styles.en1} onClick={(e) => handleReplyClick(e, post)}>
                      <span className={styles.icon}>
                        <MessageCircle size={15} />
                      </span>
                      {replyCount}
                    </span>
                    <span className={styles.en2}>
                      <span className={styles.icon}>
                        <Repeat size={15} />
                      </span>
                      {repostCount}
                    </span>
                    <span
                      className={styles.en3}
                      onClick={() => handleLikeClick(_id)}
                      style={{
                        color: isLiked ? "red" : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <span className={styles.icon}>
                        <Heart size={15} fill={isLiked ? "red" : "none"} />
                      </span>
                      {likeCount}
                    </span>
                    <span className={styles.en1}>
                      <span className={styles.icon}>
                        <Eye size={15} />
                      </span>
                      {viewCount}
                    </span>
                  </div>
                  <div className={styles.engagement2}>
                    <Bookmark size={16} />
                    <Share size={16} />
                  </div>
                </div>
              </div>
            );
          })
      )}

      {replyPopupVisible && selectedPost && (
        <ReplyPopup post={selectedPost} onClose={closeReplyPopup} />
      )}
    </div>
  );
};

export default NewsFeed;
