"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import styles from "./page.module.css";
import Navbar from "../components/Navbar/page";
import { MoreHorizontal } from "lucide-react";
import Sidebar from "../components/Sidebar/page";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("./");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div>
        <h1>Loading ...</h1>
      </div>
    );
  }
  if (!session) {
    return (
      <div>
        <h1>Please log in...</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftcontainer}>
        <Navbar/>
        <button className={styles.user}>
       {session.user?.image && (
                 <Image
                   src={session.user.image}
                   width={40}
                   height={40}
                   alt="propic"
                 ></Image>
               )}
               <div className={styles.username}>
               <h1>{session.user?.name}</h1>
               <h3>@{session.user?.name}</h3>
               </div>
               <div className={styles.icon}><MoreHorizontal/></div>
      </button>
        </div>
      <div className={styles.middlecontainer}>
        <h1>Home Page</h1>
        {session.user?.image && (
          <Image
            src={session.user.image}
            width={100}
            height={100}
            alt="propic"
          ></Image>
        )}
        <h1>{session.user?.name}</h1>
        <h1>{session.user?.email}</h1>
        <button onClick={handleSignOut}>Logout</button>
      </div>
      <div className={styles.rightcontainer}>
        <Sidebar/>
      </div>
    </div>
  );
}
