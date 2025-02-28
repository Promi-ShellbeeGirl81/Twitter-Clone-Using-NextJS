"use client";
import styles from "@/app/components/FollowButton/page.module.css";
import { usePathname, useRouter } from "next/navigation";

const NotificationMenu = () => {
  const router = useRouter();
  const pathname = usePathname();


  return (
    <div className={styles.container}>
      <button
        className={`${styles.followbtn} ${pathname === "/notifications"? styles.active : ""}`}
        onClick={() => router.push("/notifications")}
      >
        <span className={pathname === "/notifications"? styles.underline : ""}>All</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/notifications/verified" ? styles.active : ""}`}
        onClick={() =>router.push("/notifications/verified")}
      >
        <span className={pathname === "/notifications/verified" ? styles.underline : ""}>Verified</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/notifications/mentions" ? styles.active : ""}`}
        onClick={() => router.push("/notifications/mentions")}
      >
        <span className={pathname === "/notifications/mentions"  ? styles.underline : ""}>Mentions</span>
      </button>
    </div>
  );
};

export default NotificationMenu;
