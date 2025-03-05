"use client";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import ProfileInfoHeader from "@/app/components/ProfileInfoHeader/page";
import ProfileTab from "../components/ProfileTab/page";
import PostList from "../components/PostList/page";
import style from "@/app/profile/page.module.css";
import { useState, useEffect } from "react";
import { fetchUserIdByEmail } from "@/utils/api/userApi";

export default function Profile() {
  const { userId: routeUserId } = useParams(); 
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(routeUserId || null);

  useEffect(() => {
    if (!routeUserId && session?.user?.email) {
      const fetchUserId = async () => {
        const id = await fetchUserIdByEmail(session.user.email);
        if (id) setUserId(id);
      };
      fetchUserId();
    }
  }, [routeUserId, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!userId) return <p>User not found</p>;

  return (
    <div className={style.container}>
      <ProfileInfoHeader userId={routeUserId}/>
      <ProfileTab userId={routeUserId}/>
      <PostList userId={userId} /> 
    </div>
  );
}
