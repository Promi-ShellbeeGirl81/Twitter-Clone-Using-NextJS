import ProfileInfoHeader from "@/app/components/ProfileInfoHeader/page";
import ProfileTab from "../components/ProfileTab/page";
import style from "./page.module.css";
export default function Profile() {
  return (
    <div className={style.container}>
      <ProfileInfoHeader />
      <ProfileTab />
    </div>
  );
}
