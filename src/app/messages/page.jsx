"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";  // Use the useRouter hook
import styles from "./page.module.css";
import { fetchUserIdByEmail } from "@/utils/api/userApi";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter(); // For navigation to the room page
  const [users, setUsers] = useState([]);
  const username = session?.user?.name || "Unknown";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (res.ok) {
          setUsers(data);
        } else {
          console.error("Failed to fetch users:", data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserSelect = async (selectedUser, email) => {
    if (!selectedUser || !selectedUser._id) {
      console.error("Selected user is invalid:", selectedUser);
      return;
    }

    try {
      const userId = await fetchUserIdByEmail(email);

      if (!userId) {
        console.error("User ID could not be fetched.");
        return;
      }

      // Navigate to the chat room with the selected user
      router.push(`/messages/${userId}/${selectedUser._id}`);
    } catch (error) {
      console.error("Error handling user select:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Select a User to Chat</h1>
      <div className={styles.usersList}>
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className={styles.userItem}
              onClick={() => handleUserSelect(user, session?.user?.email)}
            >
              {user.name}
            </div>
          ))
        ) : (
          <p>No users available</p>
        )}
      </div>
    </div>
  );
}
