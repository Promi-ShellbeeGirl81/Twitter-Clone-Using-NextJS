"use client";
import { Settings } from "lucide-react";
import styles from "../page.module.css";
import NotificationMenu from "@/app/components/NotificationMenu/page";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Notification() {
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
    return(
        <>
        <div className={styles.headContainer}>
        <div className={styles.header}>
            <h2>Notifications</h2>
            <Settings/>
        </div>
        <NotificationMenu/>
        </div>
        <div className={styles.textContainer}>
            verified
        </div>
        </>
    );
};
