
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
  