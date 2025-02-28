"use client";
import styles from "./page.module.css";
import { usePathname, useRouter } from "next/navigation";

const FollowButton = () => {
  const router = useRouter();
  const pathname = usePathname();


  return (
    <div className={styles.container}>
      <button
        className={`${styles.followbtn} ${pathname === "/home"? styles.active : ""}`}
        onClick={() => router.push("/home")}
      >
        <span className={pathname === "/home"? styles.underline : ""}>For You</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/home/following" ? styles.active : ""}`}
        onClick={() =>router.push("/home/following")}
      >
        <span className={pathname === "/home/following" ? styles.underline : ""}>Following</span>
      </button>
    </div>
  );
};

export default FollowButton;
