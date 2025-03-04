"use client";
import styles from "@/app/components/FollowButton/page.module.css";
import ownstyles from "./page.module.css";
import { usePathname, useRouter } from "next/navigation";

const ProfileTab = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={ownstyles.container}>
      <button
        className={`${styles.followbtn} ${pathname === "/profile" ? styles.active : ""}`}
        onClick={() => router.push("/profile")}
      >
        <span className={pathname === "/profile" ? styles.underline : ""}>Posts</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/profile/replies" ? styles.active : ""}`}
        onClick={() => router.push("/profile/replies")}
      >
        <span className={pathname === "/profile/replies" ? styles.underline : ""}>Replies</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/profile/highlights" ? styles.active : ""}`}
        onClick={() => router.push("/profile/highlights")}
      >
        <span className={pathname === "/profile/highlights" ? styles.underline : ""}>Highlights</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/profile/articles" ? styles.active : ""}`}
        onClick={() => router.push("/profile/articles")}
      >
        <span className={pathname === "/profile/articles" ? styles.underline : ""}>Articles</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/profile/media" ? styles.active : ""}`}
        onClick={() => router.push("/profile/media")}
      >
        <span className={pathname === "/profile/media" ? styles.underline : ""}>Media</span>
      </button>

      <button
        className={`${styles.followbtn} ${pathname === "/profile/likes" ? styles.active : ""}`}
        onClick={() => router.push("/profile/likes")}
      >
        <span className={pathname === "/profile/likes" ? styles.underline : ""}>Likes</span>
      </button>
    </div>
  );
};

export default ProfileTab;
