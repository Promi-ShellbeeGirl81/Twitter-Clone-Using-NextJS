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

import styles from "@/app/components/newsfeed/page.module.css";
import RepostModal from "../RepostModal/page";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReplyPopup from "../replyPopup/page";
import QuotePopup from "../QuotePopup/page";
import { fetchUserIdByEmail } from "@/utils/api/userApi";
import { fetchPosts, repostPost, updateLikeStatus } from "@/utils/api/postApi";
import { sendNotification } from "@/utils/api/notificationApi";

const UserProfilePosts = () => {
  const [posts, setPosts] = useState();
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [replyPopupVisible, setReplyPopupVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [repostedPosts, setRepostedPosts] = useState({});
  const [quotePopupVisible, setQuotePopupVisible] = useState(false);
  const [quotePost, setQuotePost] = useState(null);
  const { userId: routeUserId } = useParams(); 

  const router = useRouter();

  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  const fetchUserData = useCallback(async () => {
    let id = routeUserId;

    if (!id && session?.user?.email) {
      id = await fetchUserIdByEmail(session.user.email);
    }

    if (id) {
      setUserId(id);
      fetchPostsData(id);
    }
  }, [session, routeUserId]);

  const fetchPostsData = async (userId) => {
    try {
      const postData = await fetchPosts();

      if (!Array.isArray(postData) || postData.length === 0) {
        console.warn("No posts found or invalid response format.");
        setPosts([]);
        setLoading(false);
        return;
      }

      const userPosts = postData.filter((post) => post.userId?._id === userId);

      setPosts(userPosts);

      if (userPosts.length > 0) {
        setLikedPosts(
          userPosts.reduce((acc, post) => {
            acc[post._id] = post.likedBy?.includes(userId) || false;
            return acc;
          }, {})
        );

        setRepostedPosts(
          userPosts.reduce((acc, post) => {
            acc[post._id] = post.repostedBy?.includes(userId) || false;
            return acc;
          }, {})
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const handleLikeClick = async (postId) => {
    if (!userId) return;
    const post = posts.find((p) => p._id === postId);
    if (!post) {
      console.error("Error: Post not found in state.");
      return;
    }
    const isLiked = likedPosts[postId] ?? false;
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));

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

    const updatedPost = await updateLikeStatus(postId, userId);
    if (!updatedPost) {
      setLikedPosts((prev) => ({ ...prev, [postId]: isLiked }));
    } else if (!isLiked) {
      await sendNotification({
        senderId: userId,
        receiverId: post.userId._id,
        type: "like",
        postId: post._id,
      });
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchUserData();
  }, [status, fetchUserData]);

  const handleRepost = async (postId) => {
    console.log("User and post:", userId, "and", postId);

    if (!userId || !postId) {
      console.error("Error: Missing userId or postId for repost.");
      return;
    }

    const post = posts.find((p) => p._id === postId);
    if (!post) {
      console.error("Error: Post not found in state.");
      return;
    }

    try {
      const responseData = await repostPost({
        userId,
        postId,
        isQuote: false,
        quoteText: "",
        postMedia: [],
      });

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
        await sendNotification({
          senderId: userId,
          receiverId: post.userId._id,
          type: "repost",
          postId: post._id,
        });
      }
    } catch (error) {
      console.error("Repost Error:", error);
    }
  };

  const handleQuoteClick = (post) => {
    if (!userId) {
      console.error("Error: Missing userId for quote repost.");
      return;
    }
    setQuotePost(post);
    setQuotePopupVisible(true);
  };

  const toggleModal = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setShowModal((prev) => !prev);
  };

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

  const handleReplySubmit = async (postId) => {
    const post = posts.find((p) => p._id === postId);
    if (!post) {
      console.error("Error: Post not found in state.");
      return;
    }
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, replyCount: post.replyCount + 1 }
          : post
      )
    );
    await sendNotification({
      senderId: userId,
      receiverId: post.userId._id,
      type: "comment",
      postId: post._id,
    });
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <p>Loading posts...</p>
      ) : !posts || posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts
          .filter((post) => post.parentId === null)
          .map((post) => {
            const {
              _id,
              postText,
              postMedia = [],
              replyCount = 0,
              repostCount = 0,
              likeCount = 0,
              viewCount = 0,
              userId,
              createdAt,
              originalPost,
            } = post;
            const userName = userId?.name || "Unknown User";
            const userAvatar = userId?.avatar || defaultImage;

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

                    <p>{originalPost.postText || ""}</p>
                    {originalPost.postMedia &&
                      originalPost.postMedia.length > 0 && (
                        <Image
                          src={originalPost.postMedia[0]}
                          width={600}
                          height={300}
                          alt="Original post media"
                          className={styles.postImage2}
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
                        setSelectedPost(post);
                        toggleModal(e);
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
                        color: likedPosts[_id]
                          ? "magenta"
                          : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <span className={styles.icon}>
                        <Heart
                          size={15}
                          fill={likedPosts[_id] ? "magenta" : "none"}
                        />
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

export default UserProfilePosts;
