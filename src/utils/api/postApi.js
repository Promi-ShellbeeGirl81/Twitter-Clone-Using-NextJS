export const uploadFilesToCloudinary = async (files) => {
    const uploadedMedia = [];
  
    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  
      try {
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          { method: "POST", body: formData }
        );
  
        const data = await uploadRes.json();
        if (data.secure_url) {
          uploadedMedia.push(data.secure_url);
        }
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
  
    return uploadedMedia;
  };

  export const sendReply = async ({ userEmail, postText, postMedia, parentId }) => {
    try {
      const res = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, postText, postMedia, parentId }),
      });
  
      const responseData = await res.json();
      if (!res.ok) throw new Error("Failed to send reply.");
  
      return responseData;
    } catch (error) {
      console.error("Error sending reply:", error);
      return { error: "Failed to send reply." };
    }
  };

  export const fetchPosts = async () => {
    const response = await fetch("/api/posts");
    const data = await response.json();
    return data.map((post) => ({
      ...post,
      userId: post.userId || {}, 
    }));
  };
  

  export const fetchPostAndCommentsApi = async (postId) => {
    if (!postId) return { post: null, comments: [], error: "Post ID is required" };
  
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
  
      if (data.message) {
        return { post: null, comments: [], error: data.message };
      }
  
      return {
        post: { ...data.post, postMedia: data.post.postMedia || [] },
        comments: data.comments,
        error: null,
      };
    } catch (err) {
      return { post: null, comments: [], error: "Failed to fetch data" };
    }
  };
  

  export const updateLikeStatus = async (postId, userId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });
  
      if (!res.ok) throw new Error("Failed to update like status.");
      return await res.json();
    } catch (error) {
      console.error("Error updating like status:", error);
      return null;
    }
  };
  
  export const repostPost = async ({ userId, postId, isQuote, quoteText, postMedia }) => {
    try {
      const res = await fetch(`/api/posts/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId, isQuote, quoteText, postMedia }),
      });
  
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || "Repost action failed.");
  
      return responseData;
    } catch (error) {
      console.error("Repost Action Error:", error);
      return { error: "Failed to perform repost action." };
    }
  };

  