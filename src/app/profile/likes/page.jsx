"use client";

import ProfileInfoHeader from "@/app/components/ProfileInfoHeader/page";
import ProfileTab from "@/app/components/ProfileTab/page";
import UserLikedPosts from "@/app/components/UserLikedPosts/page";
import style from "@/app/profile/page.module.css";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchUserIdByEmail } from "@/utils/api/userApi"; 

export default function Profile() {
  const { data: session } = useSession();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserIdByEmail(session.user.email).then((id) => {
        setUserId(id);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [session]);

  return (
    <div className={style.container}>
      <ProfileInfoHeader />
      <ProfileTab />

      <h2 className={style.likesTitle}>Likes</h2>
      {loading ? (
        <p>Loading...</p>
      ) : userId ? (
        <UserLikedPosts userId={userId} />
      ) : (
        <p>Please log in to view liked posts.</p>
      )}
    </div>
  );
}
