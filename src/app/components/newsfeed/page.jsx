"use client";

import {
  MessageCircle,
  Repeat,
  Heart,
  Eye,
  Bookmark,
  Share,
  Quote,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import styles from "./page.module.css";
import RepostModal from "../RepostModal/page";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReplyPopup from "../replyPopup/page";
import QuotePopup from "../QuotePopup/page";

const NewsFeed = () => {
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [replyPopupVisible, setReplyPopupVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [repostedPosts, setRepostedPosts] = useState({});
  const [quotePopupVisible, setQuotePopupVisible] = useState(false);
  const [quotePost, setQuotePost] = useState(null);

  const router = useRouter();

  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  const handleQuoteClick = (post) => {
    setQuotePost(post);
    setQuotePopupVisible(true);
  };

  const handleRepost = async (postId) => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/posts`, {
        method: "POST",
        body: JSON.stringify({ userId, postId, isQuote: false }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to repost.");
      }

      const responseData = await res.json();

      if (responseData.message.includes("Undo repost successful")) {
        setRepostedPosts((prev) => ({ ...prev, [postId]: false }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, repostCount: Math.max(post.repostCount - 1, 0) }
              : post
          )
        );
      } else if (responseData.message.includes("Repost successful")) {
        setRepostedPosts((prev) => ({ ...prev, [postId]: true }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, repostCount: post.repostCount + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Repost Error:", error);
    }
  };

  const toggleModal = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setShowModal((prev) => !prev);
  };
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
    if (!userId) {
      console.error("No valid user ID provided for fetching posts.");
      return;
    }
  
    try {
      const postRes = await fetch(`/api/posts`);
      if (!postRes.ok) throw new Error("Failed to fetch posts.");
  
      const postData = await postRes.json();
  
      // Fetching post and mapping original post details if it's a repost
      const postsWithUsers = await Promise.all(
        postData.map(async (post) => {
          let originalPost = null;
  
          // If post has an originalPostId, fetch its data and original user's details
          if (post.originalPostId) {
            try {
              const originalPostData = post.originalPostId;
              const originalUserId = originalPostData.userId;
              console.log("originalUserId: " + originalUserId);
  
              if (originalUserId) {
                // Fetch the user details of the original post
                const originalUserRes = await fetch(`/api/users/${originalUserId}`);
                if (!originalUserRes.ok) throw new Error(`Failed to fetch user for original post.`);
                const originalUser = await originalUserRes.json();
  
                // Assign original post's details including user's name, avatar, and media
                originalPost = {
                  ...originalPostData,
                  userName: originalUser.name || "Unknown",
                  userAvatar: originalUser.avatar || defaultImage,
                  postMedia: originalPostData.postMedia || [],
                };
              }
            } catch (error) {
              console.error("Error fetching original post user:", error.message);
              originalPost = {
                ...post.originalPostId,
                userName: "Unknown",
                userAvatar: defaultImage,
                postMedia: post.originalPostId?.postMedia || [],
              };
            }
          }
  
          // Fetching the user details for the current post's use
          const userRes = await fetch(`/api/users/${post.userId._id}`);
          if (!userRes.ok) throw new Error(`Failed to fetch user for post.`);
          const user = await userRes.json();
  
          return {
            ...post,
            userName: user.name || "Unknown",
            userAvatar: user.avatar || defaultImage,
            originalPost, // originalPost will be null or populated based on originalPostId
          };
        })
      );
  
      setPosts(postsWithUsers);
    } catch (error) {
      console.error("Error fetching posts and users:", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleLikeClick = async (postId) => {
    if (!userId) return;

    const isLiked = likedPosts[postId] ?? false;
    const updatedLikedPosts = { ...likedPosts, [postId]: !isLiked }; // Flip the like status
    setLikedPosts(updatedLikedPosts);

    // Optimistically update the like count
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      )
    );

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update like status.");

      const updatedPost = await res.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, ...updatedPost } : post
        )
      );
    } catch (error) {
      console.error(error);
      // Revert the like status if the API request fails
      setLikedPosts((prevLikedPosts) => ({
        ...prevLikedPosts,
        [postId]: isLiked, // revert to previous like status
      }));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
              }
            : post
        )
      );
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserId();
      const interval = setInterval(() => {
        router.refresh();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [status, fetchUserId, router]);

  const handlePostClick = (postId) => {
    router.push(`/post/${postId}`);
  };

  const handleReplyClick = (event, post) => {
    event.stopPropagation();
    setSelectedPost(post);
    setReplyPopupVisible(true);
  };

  const closeReplyPopup = () => {
    setReplyPopupVisible(false);
    setSelectedPost(null);
  };

  const handleReplySubmit = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, replyCount: post.replyCount + 1 }
          : post
      )
    );
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
              createdAt,
              originalPost,
            } = post;
            console.log(originalPost);

            const createdAtDate = new Date(createdAt);
            const timeAgo = formatDistanceToNow(createdAtDate, {
              addSuffix: true,
            });

            const isLiked = likedPosts[_id];

            return (
              <div
                key={_id}
                className={styles.post}
                onClick={() => handlePostClick(_id)}
              >
                <div className={styles.userInfo}>
                  {userAvatar && (
                    <Image
                      src={userAvatar}
                      width={35}
                      height={32}
                      alt="User profile"
                      className={styles.userImage}
                    />
                  )}

                  <div className={styles.userNames}>
                    <h3>{userName}</h3>
                    <h5>@{userName}</h5>
                    <h5>{timeAgo}</h5>
                  </div>
                </div>

                {postText && <p className={styles.postText}>{postText}</p>}

                {originalPost && (
  <div className={styles.originalPost}>
    <div className={styles.userInfo}>
      <Image
        src={originalPost.userAvatar}
        width={30}
        height={30}
        alt="Original user avatar"
      />
      <div className={styles.userNames}>
        <h4>{originalPost.userName}</h4>
      </div>
    </div>

    {/* Original Post Text */}
    <p>{originalPost.postText || ""}</p>

    {/* Original Post Media */}
    {originalPost.postMedia && originalPost.postMedia.length > 0 && (
      <Image
        src={originalPost.postMedia[0]}
        width={600}
        height={300}
        alt="Original post media"
        className={styles.postImage}
      />
    )}
  </div>
)}


                {postMedia.length > 0 && (
                  <div className={styles.postMedia}>
                    {postMedia.slice(0, 4).map(
                      (media, index) =>
                        media && (
                          <div key={index}>
                            {media.endsWith(".mp4") ||
                            media.endsWith(".webm") ? (
                              <video width="100%" controls>
                                <source
                                  src={media}
                                  type={
                                    media.endsWith(".mp4")
                                      ? "video/mp4"
                                      : "video/webm"
                                  }
                                />
                                Your browser does not support the video tag.
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
                        )
                    )}
                  </div>
                )}

                <div
                  className={styles.engagement}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.engagement1}>
                    <span
                      className={styles.en1}
                      onClick={(e) => handleReplyClick(e, post)}
                    >
                      <span className={styles.icon}>
                        <MessageCircle size={15} />
                      </span>
                      {replyCount}
                    </span>
                    <span
                      className={styles.en2}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post); // Set the post to be reposted
                        toggleModal(e); // Open the modal
                      }}
                      style={{
                        color: repostedPosts[_id]
                          ? "green"
                          : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <span className={styles.icon}>
                        <Repeat
                          size={15}
                          fill={repostedPosts[_id] ? "green" : "none"}
                        />
                      </span>
                      {repostCount}
                    </span>

                    <span
                      className={styles.en3}
                      onClick={() => handleLikeClick(_id)}
                      style={{
                        color: isLiked ? "magenta" : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <span className={styles.icon}>
                        <Heart size={15} fill={isLiked ? "magenta" : "none"} />
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

      {showModal && (
        <RepostModal
          modalPosition={modalPosition}
          onClose={() => setShowModal(false)}
          onRepost={() => {
            handleRepost(selectedPost._id);
            setShowModal(false);
          }}
          isReposted={repostedPosts[selectedPost._id] || false}
          onQuote={() => {
            handleQuoteClick(selectedPost);
            setShowModal(false);
          }}
        />
      )}

      {quotePopupVisible && quotePost && (
        <QuotePopup
          post={quotePost}
          onClose={() => setQuotePopupVisible(false)}
          onQuoteSubmit={handleReplySubmit}
        />
      )}

      {replyPopupVisible && selectedPost && (
        <ReplyPopup
          post={selectedPost}
          onClose={closeReplyPopup}
          onReplySubmit={handleReplySubmit}
        />
      )}
    </div>
  );
};

export default NewsFeed;
