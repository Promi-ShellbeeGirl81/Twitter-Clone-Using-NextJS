"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      setError("No postId provided");
      return;
    }

    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        console.log("Fetching data for postId:", postId);
        const postRes = await fetch(`/api/posts/${postId}`);
        const data = await postRes.json();

        if (data.message) {
          setError(data.message);
          return;
        }

        setPost(data.post);
        setComments(data.comments);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {post && (
        <>
          <h1>{post.postText}</h1>

          {typeof post.postMedia === 'string' && post.postMedia.trim() !== "" && (
            <Image 
              src={post.postMedia} 
              alt="post media" 
              width={700} 
              height={700} 
            />
          )}

          <h3>Comments:</h3>
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id}>
                <p>{comment.postText}</p>
                {/* Render comment media only if it's a non-empty string */}
                {typeof comment.postMedia === 'string' && comment.postMedia.trim() !== "" && (
                  <Image 
                    src={comment.postMedia} 
                    alt="comment media" 
                    width={50} 
                    height={50} 
                    unoptimized 
                  />
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default PostDetails;
