"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Home, Search, Bell, Mail, Bookmark, User, Star, MoreHorizontal, Flame, CheckCircle, Briefcase, ListChecks, FileEdit } from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

function Navbar () {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [profilePic, setProfilePic] = useState(""); 

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("./");
    }
  }, [session, status, router]);

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
  
  if (status === "loading") {
    return <div><h1>Loading ...</h1></div>;
  }
  if (!session) {
    return <div><h1>Please log in...</h1></div>;
  }

  const toggleModal = () => setShowModal((prev) => !prev);
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const menuItems = [
    { icon: Home, label: "Home", route: "/home" },
    { icon: Search, label: "Explore" },
    { icon: Bell, label: "Notifications", route: "/notifications" },
    { icon: Mail, label: "Messages", route: "/messages" },
    { icon: Flame, label: "Groks" },
    { icon: ListChecks, label: "Lists" },
    { icon: Bookmark, label: "Bookmarks" },
    { icon: Briefcase, label: "Jobs" },
    { icon: Bookmark, label: "Communities" },
    { icon: Star, label: "Premium" },
    { icon: CheckCircle, label: "Verifies Orgs" },
    { icon: User, label: "Profile", route: "/profile" },
    { icon: MoreHorizontal, label: "More" },
  ];
  const defaultImage =
    "https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";


  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <Image src="/images/logo-2.png" width="50" height="40" alt="twitter logo" />
      </div>
      
      {menuItems.map(({ icon: Icon, label, route }, index) => {
        return (
          <button key={index} className={styles.menuItem} onClick={() => route && router.push(route)}>
            <Icon size={24} />
            <span>{label}</span>
          </button>
        );
      })}

      <button className={styles.postBtn}>
        <p>Post</p>
        <div className={styles.postIcon}>
          <FileEdit />
        </div>
      </button>

      <button className={styles.user} onClick={toggleModal}>
        {profilePic && (
          <Image
            src={profilePic || defaultImage}
            width={40}
            height={40}
            alt="User Profile"
          />
        ) }
        
        <div className={styles.username}>
          <h1>{session?.user?.name}</h1>
          <h3>@{session?.user?.name}</h3>
        </div>
        
        <div className={styles.icon}>
          <MoreHorizontal />
        </div>
      </button>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Link href="/login"><button>Add an existing account</button></Link>
            <button onClick={handleSignOut}>Logout @{session?.user?.name}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
