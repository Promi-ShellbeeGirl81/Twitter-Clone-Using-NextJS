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
import QuotePopup from "@/app/components/QuotePopup/page";

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
  const [quotePopupVisible, setQuotePopupVisible] = useState(false);
  const [quotePost, setQuotePost] = useState(null);
  const [repostedPosts, setRepostedPosts] = useState({});

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

         // Map liked posts (optional feature)
      const userLikedPosts = postData.reduce((acc, post) => {
        acc[post._id] = post.likedBy?.includes(userId) || false;
        return acc;
      }, {});

      const userRepostedPosts = postData.reduce((acc, post) => {
        acc[post._id] = post.repostedBy?.includes(userId) || false;
        return acc;
      }, {});
    
        setPosts(postsWithUsers);
        setLikedPosts(userLikedPosts);
        setRepostedPosts(userRepostedPosts);
      } catch (error) {
        console.error("Error fetching posts and users:", error.message);
      } finally {
        setLoading(false);
      }
    };
    
    const handleLikeClick = async (postId, isComment = false) => {
      if (!userId) return;
    
      const isLiked = likedPosts[postId] ?? false;
      const updatedLikedPosts = { ...likedPosts, [postId]: !isLiked };
      setLikedPosts(updatedLikedPosts);
    
      if (isComment) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === postId
              ? { ...comment, likeCount: isLiked ? comment.likeCount - 1 : comment.likeCount + 1 }
              : comment
          )
        );
      } else {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1 }
              : post
          )
        );
      }
    
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          body: JSON.stringify({ userId }),
          headers: { "Content-Type": "application/json" },
        });
    
        if (!res.ok) throw new Error("Failed to update like status.");
    
        const updatedPost = await res.json();
    
        if (isComment) {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment._id === postId ? { ...comment, ...updatedPost } : comment
            )
          );
        } else {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postId ? { ...post, ...updatedPost } : post
            )
          );
        }
      } catch (error) {
        console.error(error);
        setLikedPosts((prev) => ({ ...prev, [postId]: isLiked }));
    
        if (isComment) {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment._id === postId
                ? { ...comment, likeCount: isLiked ? comment.likeCount + 1 : comment.likeCount - 1 }
                : comment
            )
          );
        } else {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postId
                ? { ...post, likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1 }
                : post
            )
          );
        }
      }
    };
    
    
    
    useEffect(() => {
      if (status === "authenticated") fetchUserId();
    }, [status, fetchUserId]);
    
    
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
    
    const handleRepost = async (postId) => {
      console.log("User and post:", userId, "and", postId);
    
      if (!userId || !postId) {
        console.error("Error: Missing userId or postId for repost.");
        return;
      }
    
      try {
        const res = await fetch(`/api/posts/repost`, {
          method: "POST",
          body: JSON.stringify({ 
            userId, 
            postId, 
            isQuote: false, 
            quoteText: "",  
            postMedia: []   
          }),
          headers: { "Content-Type": "application/json" },
        });
    
        console.log("Response:", res);
    
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
    
          // Also update comments if post is a comment
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment._id === postId
                ? { ...comment, repostCount: Math.max(comment.repostCount - 1, 0) }
                : comment
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
    
          // Also update comments if post is a comment
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment._id === postId
                ? { ...comment, repostCount: comment.repostCount + 1 }
                : comment
            )
          );
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

  const handleReplySubmit = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, replyCount: post.replyCount + 1 }
          : post
      )
    );
  };

  const closeReplyPopup = () => {
    setReplyPopupVisible(false);
    setSelectedPost(null);
  };
  
  const post = posts.find((p) => p._id === postId);
  const originalPost = post?.originalPost;
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
        className={styles.postImage2}
      />
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
              <span
                      className={styles.en2}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                        toggleModal(e);
                      }}
                      style={{
                        color: repostedPosts[post._id]
                          ? "green"
                          : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <span className={styles.icon}>
                        <Repeat
                          size={15}
                          fill={repostedPosts[post._id] ? "green" : "none"}
                        />
                      </span>
                      {post.repostCount}
                    </span>
                    <span
  className={styles.en3}
  onClick={() => handleLikeClick(post._id)}
  style={{
    color: likedPosts[post._id] ? "magenta" : "rgba(255, 255, 255, 0.5)",
  }}
>
  <span className={styles.icon}>
    <Heart size={15} fill={likedPosts[post._id] ? "magenta" : "none"} />
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
                  <span
                      className={styles.en2}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(comment);
                        toggleModal(e);
                      }}
                      style={{
                        color: repostedPosts[comment._id]
                          ? "green"
                          : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <span className={styles.icon}>
                        <Repeat
                          size={15}
                          fill={repostedPosts[comment._id] ? "green" : "none"}
                        />
                      </span>
                      {comment.repostCount}
                    </span>
                    <span
  className={styles.en3}
  onClick={() => handleLikeClick(comment._id, true)}
  style={{
    color: likedPosts[comment._id] ? "magenta" : "rgba(255, 255, 255, 0.5)",
  }}
>
  <span className={styles.icon}>
    <Heart size={15} fill={likedPosts[comment._id] ? "magenta" : "none"} />
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
      <div className={homestyles.rightcontainer}>
        <Sidebar />
      </div>
    </div>
  );
};

export default PostDetails;
