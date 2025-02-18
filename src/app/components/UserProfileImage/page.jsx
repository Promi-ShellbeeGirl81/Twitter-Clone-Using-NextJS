import Image from "next/image";
import styles from "./page.module.css";

const UserProfileImage = ({ imageUrl }) => (
  imageUrl ? <Image src={imageUrl} width={40} height={40} alt="User Profile" className={styles.userProfileImage}/> : null
);

export default UserProfileImage;
