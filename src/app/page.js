import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mainContainer">
      <div className={styles.container}>
      <div className="left"><Image src="/images/logo.png" width="900" height="900"alt="twitter logo"/></div>
      <div className="right">
        <h1> Happening now</h1>
        <h3> Join Today.</h3>
        <div className="buttons">
          <div className="googleButton">Sign up with Google</div>
          <div className="githubButton">Sign up with Github</div>
          <p>or</p>
          <div className="signupButton">Create account</div>
          <p>By signing up, you agree to the Terms of Service and Privacy Policy, including Cookie Use.</p>
          <p>Already have an account?</p>
          <Link href="/login">Sign in</Link>
          
          
        </div>

      </div>
    </div>
    <footer>
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
