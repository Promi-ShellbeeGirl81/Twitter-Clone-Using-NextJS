"use client";
import styles from "@/app/components/FollowButton/page.module.css";
import ownstyles from "./page.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ProfileTab = ({ userId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isOwner = session?.user?.id === userId;
  const basePath = isOwner ? "/profile" : `/${userId}`;

  return (
    <div className={ownstyles.container}>
      <button
        className={`${styles.followbtn} ${
          pathname === basePath? styles.active : ""
        }`}
        onClick={() => router.push(basePath)}
      >
        <span className={pathname === basePath? styles.underline : ""}>
          Posts
        </span>
      </button>

      <button
        className={`${styles.followbtn} ${
          pathname === `${basePath}/replies`? styles.active : ""
        }`}
        onClick={() => router.push(`${basePath}/replies`)}
      >
        <span
          className={pathname === `${basePath}/replies` ? styles.underline : ""}
        >
          Replies
        </span>
      </button>

      {isOwner && (
        <button
          className={`${styles.followbtn} ${
            pathname === `${basePath}/highlights` ? styles.active : ""
          }`}
          onClick={() => router.push(`${basePath}/highlights`)}
        >
          <span
            className={
              pathname === `${basePath}/highlights`? styles.underline : ""
            }
          >
            Highlights
          </span>
        </button>
      )}

      {isOwner && (
        <button
          className={`${styles.followbtn} ${
            pathname === "/profile/articles" ? styles.active : ""
          }`}
          onClick={() => router.push("/profile/articles")}
        >
          <span
            className={pathname === "/profile/articles" ? styles.underline : ""}
          >
            Articles
          </span>
        </button>
      )}

      <button
        className={`${styles.followbtn} ${
          pathname === `${basePath}/media` ? styles.active : ""
        }`}
        onClick={() => router.push(`${basePath}/media` )}
      >
        <span className={pathname === `${basePath}/media`  ? styles.underline : ""}>
          Media
        </span>
      </button>

      {isOwner && (
        <button
          className={`${styles.followbtn} ${
            pathname === "/profile/likes" ? styles.active : ""
          }`}
          onClick={() => router.push("/profile/likes")}
        >
          <span
            className={pathname === "/profile/likes" ? styles.underline : ""}
          >
            Likes
          </span>
        </button>
      )}
    </div>
  );
};

export default ProfileTab;
