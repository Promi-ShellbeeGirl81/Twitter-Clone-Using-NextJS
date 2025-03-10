"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import Chat from "./Chat/page";

const Messages = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const session = await getSession();
        if (!session || !session.user?.email) {
          throw new Error("User not authenticated");
        }

        // Fetch the user ID using their email
        const res = await fetch(`/api/users/email/${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch user ID.");

        const userData = await res.json();
        if (!userData._id) throw new Error("User ID not found.");

        setCurrentUserId(userData._id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!currentUserId) {
    return <p>Error fetching user data.</p>;
  }

  return (
    <div className="messages-page">
      <h2>Messages</h2>
      <Chat currentUserId={currentUserId} />
    </div>
  );
};

export default Messages;
