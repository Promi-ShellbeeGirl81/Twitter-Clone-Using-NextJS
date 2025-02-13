"use client";
import { useState } from "react";
import styles from "./page.module.css";

const FollowButton = () => {
  const [active, setActive] = useState("forYou");
  return (
    <div className={styles.container}>
      <button
        className={`${styles.followbtn} ${
          active === "forYou" ? styles.active : ""
        }`}
        onClick={() => setActive("forYou")}
      >
        <span className={active === "forYou" ? styles.underline : ""}>
          For you
        </span>
      </button>
      <button
        className={`${styles.followbtn} ${
          active === "following" ? styles.active : ""
        }`}
        onClick={() => setActive("following")}
      >
         <span className={active === "following" ? styles.underline : ""}>
          Following
        </span>
      </button>
    </div>
  );
};
export default FollowButton;
