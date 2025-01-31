"use client";
import { useState, useEffect } from "react";
import styles from "../register/page.module.css";
import ownstyles from "../login/page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [form, setForm] = useState({ password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get the token from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    setToken(token);
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password: form.password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login"); // Redirect to login after successful password reset
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (error) {
      setError("Error resetting password");
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
          <h2>Reset Your Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit}>
          <div className={styles.formGroup}>
            <input
              type="password"
              name="password"
              placeholder="Enter your new password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.homebuttons}>
            <button
              className={ownstyles.nextButton}
              type="submit"
              disabled={!form.password || form.password.length < 8 || pending}
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
