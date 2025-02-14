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
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const NewsFeed = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("Session Status:", status);
    console.log("Session Data:", session);
  
    if (status !== "authenticated" || !session?.user?.email) {
      console.log("User not authenticated or session not loaded yet.");
      return;
    }
  
    const fetchUserId = async () => {
      try {
        const res = await fetch(`/api/users/email/${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch user ID.");
        
        const userData = await res.json();
        console.log("Fetched User Data:", userData);
  
        if (!userData._id) {
          console.error("User ID is missing from response.");
          return;
        }
  
        fetchPostAndUsers(userData._id); 
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
  
    fetchUserId();
  }, [session, status]);
  
  const fetchPostAndUsers = async (userId) => {
    try {
      const [postResponse, userResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/posts`),
        fetch(`http://localhost:3000/api/users`),
      ]);
  
      if (!postResponse.ok || !userResponse.ok) {
        throw new Error("Failed to fetch posts or users.");
      }
  
      const postData = await postResponse.json();
      const userData = await userResponse.json();
      console.log("Fetched Posts:", postData);
      console.log("Fetched Users:", userData);
  
      const userLikedPosts = {};
      postData.forEach((post) => {
        const likedBy = post.likedBy || [];
        userLikedPosts[post._id] = likedBy.includes(userId);
      });
  
      setPosts(postData);
      setUsers(userData);
      setLikedPosts(userLikedPosts);
    } catch (error) {
      console.error("Error fetching posts or users:", error);
    }
  };
  

  const handleLikeClick = async (postId) => {
    try {
      if (!session?.user?.email) {
        console.warn("User is not authenticated.");
        return;
      }
  
      // Fetch user ID based on email
      const userRes = await fetch(`/api/users/email/${session.user.email}`);
      if (!userRes.ok) {
        console.error("Failed to fetch user ID.");
        return;
      }
  
      const userData = await userRes.json();
      const userId = userData._id; // Ensure userId is retrieved
  
      if (!userId) {
        console.error("User ID is missing.");
        return;
      }
  
      console.log("User ID:", userId);
  
      // Send like request
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
  
      if (!res.ok) {
        const error = await res.json();
        console.error("Error:", error.error);
        return;
      }
  
      const updatedPost = await res.json();
  
      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likeCount: updatedPost.likeCount, likedBy: updatedPost.likedBy }
            : post
        )
      );
  
      // Toggle like status
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));
    } catch (error) {
      console.error("Error updating like count", error);
    }
  };
  

  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

  return (
    <div className={styles.container}>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post) => {
          const replyCount = Number(post.replyCount) || 0;
          const repostCount = Number(post.repostCount) || 0;
          const likeCount = Number(post.likeCount) || 0;
          const viewCount = Number(post.viewCount) || 0;

          const user = users.find((u) => u._id === post.userId);
          const userName = user ? user.name : "unknown";

          const isLiked = likedPosts[post._id];

          return (
            <div key={post._id} className={styles.post}>
              <div className={styles.userInfo}>
                <Image
                  src={(post.userImage || defaultImage).trim()}
                  width={35}
                  height={32}
                  alt="user profile"
                  className={styles.userImage}
                />

                <div className={styles.userNames}>
                  <h3>{userName}</h3>
                  <h5>@{userName}</h5>
                </div>
              </div>

              {post.postText && (
                <p className={styles.postText}>{post.postText}</p>
              )}

              {Array.isArray(post.postMedia) && post.postMedia.length > 0 && (
                <div className={styles.postMedia}>
                  {post.postMedia.slice(0, 4).map((media, index) => (
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
                          alt={`post content ${index + 1}`}
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

              <div className={styles.engagement}>
                <div className={styles.engagement1}>
                  <span className={styles.en1}>
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
                    onClick={() => handleLikeClick(post._id)}
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
                  <span className={styles.en1}>
                    <span className={styles.icon}>
                      <Bookmark size={16} />
                    </span>
                  </span>
                  <span className={styles.en1}>
                    <span className={styles.icon}>
                      <Share size={16} />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NewsFeed;
