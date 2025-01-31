"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

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
  if(!session) {
    return (
      <div>
        <h1>Please log in...</h1>
      </div>
    );
  }

  return (
    <div>
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
  );
}
