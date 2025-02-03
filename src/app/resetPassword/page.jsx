"use client";
import { useState, useEffect } from "react";
import styles from "../register/page.module.css";
import ownstyles from "../login/page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PasswordReset() {
  const [step, setStep] = useState("email"); // Email entry first
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const emailFromUrl = urlParams.get("email");
  
    console.log("URL Params:", urlParams);
    console.log("Token:", tokenFromUrl);
    console.log("Email:", emailFromUrl);
  
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setEmail(emailFromUrl || ""); 
      setStep("reset");
    }
  }, []);  

  // Handle Email Submission (Step 1)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
    
      if (!res.ok) {
        setError(data.message || "Failed to send reset email");
      } else {
        setStep("emailSent"); // Proceed to email sent confirmation step
      }
    } catch (error) {
      setError("Error sending reset email");
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  // Handle Password Reset (Step 2)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setPending(true);
    setError("");

    try {
      // In step 2, we're submitting the email from the URL, so only the password is required
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      console.log("Request body:", { email, token, password });

      const data = await res.json();
      console.log("Server Response:", data);
      if (res.ok) {
        router.push("/login");
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
          <h2>{step === "reset" ? "Reset Your Password" : "Forgot Password"}</h2>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <div className={styles.formGroup}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={pending} // Disable while pending
              />
              {error && <p className={styles.error}>{error}</p>}
            </div>
            <div className={styles.homebuttons}>
              <button
                className={ownstyles.nextButton}
                type="submit"
                disabled={!email || pending} // Disable submit when email is empty or pending
              >
                {pending ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        {step === "emailSent" && (
          <p className={styles.success}>✅ A reset link has been sent to your email.</p>
        )}

        {step === "reset" && (
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.formGroup}>
              {/* Email field in step 2, it's disabled and readonly */}
              <input
                type="email"
                name="email"
                value={email}
                readOnly
                disabled
                className={styles.readOnlyInput} // Optional: Add specific styling for read-only inputs
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="password"
                name="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className={styles.error}>{error}</p>}
            </div>
            <div className={styles.homebuttons}>
              <button
                className={ownstyles.nextButton}
                type="submit"
                disabled={!password || password.length < 8 || pending} 
              >
                {pending ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
