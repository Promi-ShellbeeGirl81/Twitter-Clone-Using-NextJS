"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  MessageCircle,
  Repeat,
  Heart,
  Eye,
} from "lucide-react";
import RepostModal from "@/app/components/RepostModal/page";
import styles from "../../components/newsfeed/page.module.css";
import homestyles from "@/app/home/page.module.css";
import Navbar from "@/app/components/Navbar/page";
import Sidebar from "@/app/components/Sidebar/page";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReplyPopup from "@/app/components/replyPopup/page";

const PostDetails = () => {
  const { postId } = useParams();
  const [userId, setUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyPopupVisible, setReplyPopupVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const[showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const router = useRouter();
  const { data: session, status } = useSession();

  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

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
      const postRes = await fetch(`/api/posts`);
      if (!postRes.ok) throw new Error("Failed to fetch posts.");

      const postData = await postRes.json();

      const postsWithUsers = postData.map((post) => {
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

  const toggleModal = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setShowModal((prev) => !prev);
  };

  const handleLikeClick = async (id, isComment = false) => {
    if (!userId) return;

    const isLiked = likedPosts[id] ?? false;

    // Optimistically update the UI
    setLikedPosts((prev) => ({ ...prev, [id]: !isLiked }));

    if (isComment) {
      // Update the comment likeCount optimistically
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === id
            ? {
                ...comment,
                likeCount: isLiked
                  ? comment.likeCount - 1
                  : comment.likeCount + 1,
              }
            : comment
        )
      );
    } else {
      // Update the post likeCount optimistically
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id
            ? {
                ...post,
                likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
    }

    try {
      const res = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update like status.");

      const updatedData = await res.json();

      // Sync state with the server response
      if (isComment) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === id
              ? { ...comment, likeCount: updatedData.likeCount }
              : comment
          )
        );
      } else {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === id
              ? { ...post, likeCount: updatedData.likeCount }
              : post
          )
        );
      }
    } catch (error) {
      console.error(error);

      // Revert like status and count on error
      setLikedPosts((prev) => ({ ...prev, [id]: isLiked }));
      if (isComment) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === id
              ? {
                  ...comment,
                  likeCount: isLiked
                    ? comment.likeCount + 1
                    : comment.likeCount - 1,
                }
              : comment
          )
        );
      } else {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === id
              ? {
                  ...post,
                  likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
                }
              : post
          )
        );
      }
    }
  };
  useEffect(() => {
    if (status === "authenticated") fetchUserId();
  }, [status, fetchUserId]);

  const handlePostClick = (postId) => {
    router.push(`/post/${postId}`);
  };

  const handleReplyClick = (event, post) => {
    event.stopPropagation();
    setSelectedPost(post);
    setReplyPopupVisible(true);
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

  const fetchPostAndComments = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      if (data.message) {
        setError(data.message);
        return;
      }
      setPosts([
        {
          ...data.post,
          postMedia: data.post.postMedia || [],
        },
      ]);
      setComments(data.comments);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchPostAndComments();
  }, [status, postId]);

  const closeReplyPopup = () => {
    setReplyPopupVisible(false);
    setSelectedPost(null);
  };
  const post = posts.find((p) => p._id === postId);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={homestyles.container}>
      <div className={homestyles.leftcontainer}>
        <Navbar />
      </div>
      <div className={homestyles.middlecontainer}>
        <div className={styles.post}>
          <div className={styles.userInfo}>
            <Image
              src={post.userId.userAvatar || defaultImage}
              width={35}
              height={32}
              alt="User profile"
              className={styles.userImage}
            />
            <div className={styles.userNames}>
              <h3>{post.userId.name}</h3>
              <h5>@{post.userId.name}</h5>
            </div>
          </div>
          <p className={styles.postText}>{post.postText}</p>

          {/* Post Media */}
          {post?.postMedia?.length > 0 && (
            <div className={styles.postMedia}>
              {post.postMedia.slice(0, 4).map((media, index) => (
                <div key={index}>
                  {media.endsWith(".mp4") || media.endsWith(".webm") ? (
                    <video width="100%" controls>
                      <source
                        src={media}
                        type={
                          media.endsWith(".mp4") ? "video/mp4" : "video/webm"
                        }
                      />
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
              {post.postMedia.length > 4 && (
                <div className={styles.extraMedia}>
                  +{post.postMedia.length - 4} more
                </div>
              )}
            </div>
          )}

          {/* Engagement Section */}
          <div
            className={styles.engagement}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.engagement1}>
              <span className={styles.en1} onClick={(e) => handleReplyClick(e, post)}>
                <span className={styles.icon}>
                  <MessageCircle size={15} />
                </span>{" "}
                {post.replyCount}
              </span>
              <span className={styles.en2} onClick={toggleModal}>
                <span className={styles.icon}>
                  <Repeat size={15} />
                </span>{" "}
                {post.repostCount}
              </span>
              <span
                className={styles.en3}
                onClick={() => handleLikeClick(post._id)} 
                style={{
                  color: likedPosts[post._id]
                    ? "magenta"
                    : "rgba(255, 255, 255, 0.5)",
                }}
              >
                <span className={styles.icon}>
                  <Heart
                    size={15}
                    fill={likedPosts[post._id] ? "magenta" : "none"}
                  />
                </span>{" "}
                {post.likeCount}
              </span>

              <span className={styles.en1}>
                <span className={styles.icon}>
                  <Eye size={15} />
                </span>{" "}
                {post.viewCount}
              </span>
            </div>
          </div>
        </div>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className={styles.post}
              onClick={() => handlePostClick(comment._id)}
            >
              <div className={styles.userInfo}>
                <Image
                  src={comment.userId?.avatar || defaultImage}
                  width={35}
                  height={32}
                  alt="User profile"
                  className={styles.userImage}
                />
                <div className={styles.userNames}>
                  <h3>{comment.userId?.name}</h3>
                  <h5>@{comment.userId?.name}</h5>
                </div>
              </div>
              <p className={styles.postText}>{comment.postText}</p>
              {comment?.postMedia?.length > 0 && (
            <div className={styles.postMedia}>
              {comment.postMedia.slice(0, 4).map((media, index) => (
                <div key={index}>
                  {media.endsWith(".mp4") || media.endsWith(".webm") ? (
                    <video width="100%" controls>
                      <source
                        src={media}
                        type={
                          media.endsWith(".mp4") ? "video/mp4" : "video/webm"
                        }
                      />
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
              {comment.postMedia.length > 4 && (
                <div className={styles.extraMedia}>
                  +{comment.postMedia.length - 4} more
                </div>
              )}
            </div>
          )}

              <div
                className={styles.engagement}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.engagement1}>
                  <span className={styles.en1}>
                    <span
                      className={styles.icon}
                      onClick={(e) => handleReplyClick(e, comment)}
                    >
                      <MessageCircle size={15} />
                    </span>{" "}
                    {comment.replyCount}
                  </span>
                  <span className={styles.en2} onClick={toggleModal}>
                    <span className={styles.icon}>
                      <Repeat size={15} />
                    </span>{" "}
                    {comment.repostCount}
                  </span>
                  <span
                    className={styles.en3}
                    onClick={() => handleLikeClick(comment._id, true)} // Pass true for comment
                    style={{
                      color: likedPosts[comment._id]
                        ? "magenta"
                        : "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <span className={styles.icon}>
                      <Heart
                        size={15}
                        fill={likedPosts[comment._id] ? "magenta" : "none"}
                      />
                    </span>{" "}
                    {comment.likeCount}
                  </span>

                  <span className={styles.en1}>
                    <span className={styles.icon}>
                      <Eye size={15} />
                    </span>{" "}
                    {comment.viewCount}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

{showModal && (
        <RepostModal
          modalPosition={modalPosition}
          onClose={() => setShowModal(false)}
          onRepost={() => {
            console.log("Repost action");
            setShowModal(false);
          }}
          onQuote={() => {
            console.log("Quote action");
            setShowModal(false);
          }}
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
      <div className={homestyles.rightcontainer}>
        <Sidebar />
      </div>
    </div>
  );
};

export default PostDetails;
