"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import FollowTab from "@/app/components/FollowTab/page";
import UserList from "@/app/components/followUserList/page";
import styles from "@/app/components/FollowButton/page.module.css";
import ownstyles from "@/app/components/ProfileTab/page.module.css";

const FollowersTabs = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userId = pathname.split("/")[1]; 

  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    if (session) {
      const fetchProfilePic = async () => {
        try {
          const response = await fetch(`/api/users/email/${session.user.email}`);
          const data = await response.json();
          if (data && data.profilePic) {
            setProfilePic(data.profilePic);
          }
        } catch (error) {
          console.error("Failed to fetch profile pic:", error);
        }
      };

      fetchProfilePic();
    }
  }, [session]);

  return (
    <div className={styles.mainContainer}>
      <div className={ownstyles.container}>
        <FollowTab userId={userId} />
      </div>
      <UserList
        endpoint={`/api/users/${userId}/followers`}
        title="Followers"
        profilePic={profilePic}
      />
    </div>
  );
};

export default FollowersTabs;
