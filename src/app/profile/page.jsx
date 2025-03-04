import ProfileInfoHeader from "@/app/components/ProfileInfoHeader/page";
import ProfileTab from "../components/ProfileTab/page";
import style from "./page.module.css";
import ProfilePosts from "../components/ProfilePosts/page";
export default function Profile() {
  return (
    <div className={style.container}>
      <ProfileInfoHeader />
      <ProfileTab />
      <ProfilePosts/>
    </div>
  );
}
