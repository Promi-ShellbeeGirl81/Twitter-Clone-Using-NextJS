import styles from "./page.module.css";
import {
  FileImage,
  Image as LucideImage,
  Smile,
  MapPin,
  Globe,
  AlarmClock,
  Flame,
} from "lucide-react";
import { FaPoll } from "react-icons/fa";
const IconsSection = () => {
    return (
      <div className={styles.posticonSection}>
        <div className={styles.posticon}>
          <LucideImage size={18} onClick={() => document.getElementById("fileUploadInput").click()} />
        </div>
        <div className={styles.posticon}>
          <FileImage size={18} />
        </div>
        <div className={styles.posticon}>
          <Flame size={18} />
        </div>
        <div className={styles.posticon}>
          <FaPoll size={18} />
        </div>
        <div className={styles.posticon}>
          <Smile size={18} />
        </div>
        <div className={styles.posticon}>
          <AlarmClock size={18} />
        </div>
        <div className={styles.posticon}>
          <MapPin size={18} />
        </div>
      </div>
    );
  };
  export default IconsSection;