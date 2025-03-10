"use client";
import styles from "@/app/home/page.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FollowButton from "@/app/components/FollowButton/page";
import StatusUpdate from "@/app/components/StatusUpdate/page";
import PostList from "@/app/components/PostList/page";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("./");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div>
        <h1>Loading ...</h1>
      </div>
    );
  }
  if (!session) {
    return (
      <div>
        <h1>Please log in...</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <FollowButton />
      <StatusUpdate />
      <PostList isHomepage={true} />
    </div>
  );
}
