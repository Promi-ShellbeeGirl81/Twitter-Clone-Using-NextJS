"use client";
import { useState } from "react";
import styles from "../register/page.module.css";
import ownstyles from "../login/page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setPending(true);

    try {
      const res = await fetch("/api/auth/send-reset-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset email");
      }
      else set
    } catch (error) {
      setError("Error sending reset email");
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>
            <Image
              className={styles.headerLogo}
              src="/images/logo.png"
              width="40"
              height="35"
              alt="Logo"
            />
          </div>
          <h2>Forgot Password</h2>
        </div>

        <form onSubmit={handleEmailSubmit}>
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.homebuttons}>
            <button
              className={ownstyles.nextButton}
              type="submit"
              disabled={!email || pending}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
