"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import styles from "@/app/components/FollowButton/page.module.css";

const FollowTab= ({ userId }) => {
  const router = useRouter();
  const pathname = usePathname();

  const basePath = `/${userId}`;

  return (
    <div className={styles.container}>
      {/* Verified Followers Button */}
      <button
        className={`${styles.followbtn} ${pathname === `${basePath}/verified-followers` ? styles.active : ""}`}
        onClick={() => router.push(`${basePath}/verified-followers`)}
      >
        <span className={pathname === `${basePath}/verified-followers` ? styles.underline : ""}>
          Verified Followers
        </span>
      </button>

      {/* Followers Button */}
      <button
        className={`${styles.followbtn} ${pathname === `${basePath}/followers` ? styles.active : ""}`}
        onClick={() => router.push(`${basePath}/followers`)}
      >
        <span className={pathname === `${basePath}/followers` ? styles.underline : ""}>
          Followers
        </span>
      </button>

      {/* Following Button */}
      <button
        className={`${styles.followbtn} ${
          pathname === `${basePath}/following` || pathname === basePath ? styles.active : ""
        }`}
        onClick={() => router.push(`${basePath}/following`)}
      >
        <span
          className={
            pathname === `${basePath}/following` || pathname === basePath
              ? `${styles.underline} ${styles.active}`
              : ""
          }
        >
          Following
        </span>
      </button>
    </div>
  );
};

export default FollowTab;
