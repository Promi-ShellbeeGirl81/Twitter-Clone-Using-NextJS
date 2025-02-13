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

const NewsFeed = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPostAndUsers = async () => {
      try {
        const postResponse = await fetch(`http://localhost:3000/api/posts`);
        const postData = await postResponse.json();
        const userIds = [...new Set(postData.map((post) => post.userId))];
        const userPromises = userIds.map((userId) =>
          fetch(`http://localhost:3000/api/users/${userId}`).then((res) =>
            res.json()
          )
        );
        const usersData = await Promise.all(userPromises);
        setUsers(usersData);
        setPosts(postData);
      } catch (error) {
        console.log(error);
        setUsers([]);
        setPosts([]);
      }
    };
    fetchPostAndUsers();
  }, []);

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
          const user = users.find((user) => user._id === post.userId);
          const userName = user ? user.name : "unknown";
          const userNickName = user ? user.nickname : "unknown";
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
                  <h3> {userName} </h3>
                  <h5> @{userName} </h5>
                </div>
              </div>
              {post.postText && (
                <p className={styles.postText}> {post.postText}</p>
              )}
              {post.postMedia &&
                Array.isArray(post.postMedia) &&
                post.postMedia.length > 0 && (
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
                      <MessageCircle size={15} />{" "}
                    </span>
                    {replyCount}
                  </span>
                  <span className={styles.en2}>
                    <span className={styles.icon}>
                      <Repeat size={15} />{" "}
                    </span>
                    {repostCount}
                  </span>
                  <span className={styles.en3}>
                    <span className={styles.icon}>
                      <Heart size={15} />{" "}
                    </span>
                    {likeCount}
                  </span>
                  <span className={styles.en1}>
                    <span className={styles.icon}>
                      <Eye size={15} />
                    </span>{" "}
                    {viewCount}
                  </span>
                </div>
                <div className={styles.engagement2}>
                  <span className={styles.en1}>
                    <span className={styles.icon}>
                      <Bookmark size={16} />{" "}
                    </span>
                  </span>
                  <span className={styles.en1}>
                    <span className={styles.icon}>
                      <Share size={16} />{" "}
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
