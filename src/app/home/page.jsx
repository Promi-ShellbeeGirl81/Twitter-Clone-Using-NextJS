"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "../components/Navbar/page";
import Sidebar from "../components/Sidebar/page";
import FollowButton from "../components/FollowButton/page";
import StatusUpdate from "../components/StatusUpdate/page";
import NewsFeed from "../components/newsfeed/page";


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
      <div className={styles.leftcontainer}>
        <Navbar/>
        </div>
      <div className={styles.middlecontainer}>
        <FollowButton/>
        <StatusUpdate/>
        <NewsFeed/>
      </div>
      <div className={styles.rightcontainer}>
        <Sidebar/>
      </div>
    </div>
  );
}
