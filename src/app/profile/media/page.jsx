import ProfileInfoHeader from "@/app/components/ProfileInfoHeader/page";
import ProfileTab from "@/app/components/ProfileTab/page";
import style from "../../profile/page.module.css";
export default function Profile() {
  return (
    <div className={style.container}>
      <ProfileInfoHeader />
      <ProfileTab />
      media
    </div>
  );
}
