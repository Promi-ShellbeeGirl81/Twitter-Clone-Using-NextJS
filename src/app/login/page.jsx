"use client";
import { useEffect, useState } from "react";
import styles from "../register/page.module.css";
import ownstyles from "./page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";

export default function LoginModal() {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
  });

  const handleProvider = async (provider) => {
    await signIn(provider, {
      callbackUrl: "/home",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);

    const res = await signIn("credentials", {
      redirect: false,
      identifier: form.identifier,
      password: form.password,
    });

    if (res.error) {
      setErrors((prev) => ({
        ...prev,
        password: "Incorrect password. Please try again.",
      }));
    } else if (res.ok) {
      router.push("./home");
    }
    setPending(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data);
        setIsLoadingUsers(false);
      } catch (error) {
        console.log(error);
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const isFormValid = form.identifier.trim() && !errors.identifier;
  const isPasswordValid = form.password.trim() && !errors.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "identifier") {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          identifier: "This field cannot be empty",
        }));
      } else {
        setErrors((prev) => ({ ...prev, identifier: "" }));
      }
    }

    if (name === "password") {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          password: "Password cannot be empty",
        }));
      } else if (value.length < 8) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 8 characters long",
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          {step === 1 && (
            <>
              <div className={styles.headerIcon}>
                <Link className={styles.closeButton} href="/">
                  <button>&times;</button>
                </Link>
                <Image
                  className={styles.headerLogo}
                  src="/images/logo.png"
                  width="40"
                  height="35"
                  alt="twitter logo"
                />
              </div>
              <h2>Sign in to X</h2>
            </>
          )}
          {step === 2 && (
            <>
              <div className={styles.headerIcon}>
                <Image
                  className={styles.headerLogo}
                  src="/images/logo.png"
                  width="40"
                  height="35"
                  alt="twitter logo"
                />
              </div>
              <h2>Enter your Password</h2>
            </>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className={styles.homebuttons}>
                <button
                  className={ownstyles.googleButton}
                  onClick={() => handleProvider("google")}
                >
                  <FcGoogle size={20} />
                  Sign in with Google
                </button>

                <button
                  className={ownstyles.githubButton}
                  onClick={() => handleProvider("github")}
                >
                  <FaGithub size={20} />
                  Sign in with Github
                </button>

                <div className={ownstyles.divider}>
                  <span>or</span>
                </div>
              </div>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Phone, email, or username"
                  value={form.identifier}
                  onChange={handleChange}
                  required
                />
                {errors.identifier && (
                  <p className={styles.error}>{errors.identifier}</p>
                )}
              </div>
              <div className={styles.homebuttons}>
                <button
                  className={ownstyles.nextButton}
                  onClick={() => setStep(2)}
                  disabled={!isFormValid}
                >
                  Next
                </button>

                <button
                  className={ownstyles.forgetButton}
                  onClick={() => {
                    router.push("./resetPassword");
                    console.log("Navigating to forgetPassword...");
                  }}
                >
                  Forgot Password
                </button>

                <p className={ownstyles.noAccount}>
                  Don't have an account?{" "}
                  <Link href="./register">
                    <span>Sign Up</span>
                  </Link>
                </p>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Phone, email, or username"
                  value={form.identifier}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (
                  <p className={styles.error}>{errors.password}</p>
                )}
              </div>

              <button
                className={styles.registerSubmit}
                type="submit"
                disabled={!isPasswordValid || isLoadingUsers || errors.identifier}
              >
                Log in
              </button>
              {errors.identifier && (
                <p className={styles.error}>{errors.identifier}</p>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
