import {Home, Search, Bell, Mail, Bookmark, User, Star, MoreHorizontal, Flame, CheckCircle, Briefcase, ListChecks, PenBoxIcon, PenSquare, FileEdit} from "lucide-react";
import styles from "./page.module.css";
import Image from "next/image";

const Navbar = () => {
  const menuItems = [
    { icon: Home, label: "Home" },
    { icon: Search, label: "Explore" },
    { icon: Bell, label: "Notifications" },
    { icon: Mail, label: "Messages" },
    { icon: Flame, label: "Groks" },
    { icon: ListChecks, label: "Lists" },
    { icon: Bookmark, label: "Bookmarks" },
    { icon: Briefcase, label: "Jobs" },
    { icon: Bookmark, label: "Communities" },
    { icon: Star, label: "Premium" },
    { icon: CheckCircle, label: "Verifies Orgs" },
    { icon: User, label: "Profile" },
    { icon: MoreHorizontal, label: "More" },
  ];
  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <Image
          src="/images/logo-2.png"
          width="50"
          height="40"
          alt="twitter logo"
        />
      </div>
      {menuItems.map(({ icon: Icon, label }, index) => {
        return(
          <button key={index} className={styles.menuItem}>
          <Icon size={24} />
          <span>{label}</span>
        </button>
        );
      })}
      <button className={styles.postBtn}>
       <p>Post</p>
        <div className={styles.postIcon}><FileEdit/></div>
      </button>
      
    </div>
  );
};
export default Navbar;
