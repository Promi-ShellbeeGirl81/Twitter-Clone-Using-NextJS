import { getSession } from "next-auth/react";

export const fetchSessionUserPosts = async () => {
  try {
    const session = await getSession();
    if (!session || !session.user?.email) {
      return { posts: [], error: "User not authenticated" };
    }
    const userRes = await fetch(`/api/users/email/${session.user.email}`);
    if (!userRes.ok) throw new Error("Failed to fetch user data.");
    console.log(userRes);
    const userData = await userRes.json();
    console.log("user", userData);
    const userId = userData?._id;
    if (!userId) throw new Error("User ID not found.");

    const postsRes = await fetch(`/api/posts/user/${userId}`);
    if (!postsRes.ok) throw new Error("Failed to fetch user posts.");

    const postsData = await postsRes.json();
    return { posts: postsData.posts || [], error: null };
  } catch (error) {
    console.error("Error fetching session user posts:", error);
    return { posts: [], error: "Failed to fetch user posts." };
  }
};

export const fetchUserIdByEmail = async (email) => {
  try {
    const res = await fetch(`/api/users/email/${email}`);
    if (!res.ok) throw new Error("Failed to fetch user ID.");
    const userData = await res.json();
    if (!userData._id) throw new Error("User ID missing.");
    return userData._id;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchUserById = async (userId) => {
  try {
    const userRes = await fetch(`/api/users/${userId}`);
    if (!userRes.ok) throw new Error("Failed to fetch user.");
    return await userRes.json();
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
};
