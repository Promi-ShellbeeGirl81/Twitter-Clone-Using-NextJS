"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

const handleProvider = async(provider) =>{
  await signIn(provider, {
    callbackUrl: "/home",
  });
};

export default function Home() {

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
      <div className={styles.left}><Image src="/images/logo.png" width="600" height="550"alt="twitter logo"/></div>
      <div className={styles.right}>
        <h1> Happening now</h1>
        <h3> Join Today.</h3>
        <div className={styles.buttons}>
        <button className={styles.googleButton} onClick={()=>handleProvider("google")}>
            <FcGoogle size={20} />Sign up with Google
            </button>
          
            <button className={styles.githubButton} onClick={()=>handleProvider("github")}>
            <FaGithub size={20} />Sign up with Github
            </button>
      
          <div className={styles.divider}>
          <span>or</span>
          </div>
          <Link href="/register"><div className={styles.signupButton}>Create account</div></Link>
          <div className={styles.agreement}>
          By signing up, you agree to the <span><Link href= "#">Terms of Service</Link></span> and <span><Link href= "#">Privacy Policy</Link></span>, including <span><Link href= "#">Cookie Use.</Link></span>
          </div>
          <div className={styles.alreadyAcc}>Already have an account?</div>
          <Link href="/login"><div className={styles.signinButton}>Sign in</div></Link>
      </div>
      </div>
    </div>
    <footer className={styles.loginFooter}>
      <Link href="#">About</Link>
      <Link href="#">Download the X app</Link>
      <Link href="#">Help Center</Link>
      <Link href="#">Terms of Service</Link>
      <Link href="#">Privacy Policy</Link>
      <Link href="#">Cookie Policy</Link>
      <Link href="#">Accessibility</Link>
      <Link href="#">Ads info</Link>
      <Link href="#">Blog</Link>
      <Link href="#">Careers</Link>
      <Link href="#">Brand Resources</Link>
      <Link href="#">Advertising</Link>
      <Link href="#">Marketing</Link>
      <Link href="#">X for Business</Link>
      <Link href="#">Developers</Link>
      <Link href="#">Directory</Link>
      <Link href="#">Settings </Link>
      <Link href="#">© 2025 X Corp.</Link>
    </footer>
    </div>
  );
}
