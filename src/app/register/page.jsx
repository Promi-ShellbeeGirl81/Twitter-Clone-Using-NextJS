"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterModal({ closeModal }) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [days, setDays] = useState(31);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setPending(true);
    if (!form.name || !form.email || !form.password || !selectedMonth || !selectedDay || !selectedYear) {
      alert("Please fill all the required fields.");
      setPending(false);
      return;
    }
    const fullDOB = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    const updatedForm = { ...form, dateOfBirth: fullDOB };
    try {
      const res = await fetch("api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedForm),
      });
      if (res.ok) {
        setPending(false);
        router.push("/home");
        //console.log(updatedForm);
      } else {
        setPending(false);
        //console.log(updatedForm);
      }
    } catch (error) {
      setPending(false);
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && !value.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name cannot be empty" }));
    } else {
      setErrors((prev) => ({ ...prev, name: "" }));
    }

    if (name === "email") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, email: "Email cannot be empty" }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      } else if (users.some((user) => user.email === value)) {
        setErrors((prev) => ({ ...prev, email: "Email is already taken" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "password" && !value.trim()) {
      setErrors((prev) => ({ ...prev, password: "Password cannot be empty" }));
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const isFormValid =
    !errors.name &&
    !errors.email &&
    form.name &&
    form.email &&
    selectedDay &&
    selectedMonth &&
    selectedYear;
  const isFormValid2 = !errors.password && form.password;

  const months = [
    { value: 1, label: "January", days: 31 },
    { value: 2, label: "February", days: 28 },
    { value: 3, label: "March", days: 31 },
    { value: 4, label: "April", days: 30 },
    { value: 5, label: "May", days: 31 },
    { value: 6, label: "June", days: 30 },
    { value: 7, label: "July", days: 31 },
    { value: 8, label: "August", days: 31 },
    { value: 9, label: "September", days: 30 },
    { value: 10, label: "October", days: 31 },
    { value: 11, label: "November", days: 30 },
    { value: 12, label: "December", days: 31 },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 125 }, (_, i) => currentYear - i);

  const handleMonthChange = (e) => {
    const monthValue = parseInt(e.target.value);
    setSelectedMonth(monthValue);
    const month = months.find((m) => m.value === monthValue);
    if (month) {
      if (month.value === 2 && isLeapYear(selectedYear)) {
        setDays(29);
      } else setDays(month.days);
    }
  };

  const handleYearChange = (e) => {
    const yearValue = parseInt(e.target.value);
    setSelectedYear(yearValue);

    if (selectedMonth === 2) {
      setDays(isLeapYear(yearValue) ? 29 : 28);
    }
  };

  const handleDayChange = (e) => {
    setSelectedDay(parseInt(e.target.value));
  };

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          {step === 1 && (
            <>
              <div className={styles.headerIcon}>
                <button className={styles.closeButton} onClick={closeModal}>
                  &times;
                </button>
                <Image
                  className={styles.headerLogo}
                  src="/images/logo.png"
                  width="40"
                  height="35"
                  alt="twitter logo"
                />
              </div>
              <h2>Create your account</h2>
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
              <h2>You'll need a Password</h2>
            </>
          )}
        </div>
        <form onSubmit={handleSignUp}>
          {step === 1 && (
            <>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className={styles.error}>{errors.name}</p>}
              </div>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
              </div>
              <div className={styles.formGroup}>
                <label>Date of birth</label>
                <p className={styles.dobMessage}>
                  This will not be shown publicly. Confirm your own age, even if
                  this account is for a business, a pet, or something else.
                </p>
                <div className={styles.dob}>
                  <div className={styles.selectWrapper}>
                    <label htmlFor="month">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      required
                    >
                      <option value="" disabled>
                        Month
                      </option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.selectWrapper}>
                    <label htmlFor="day">Day</label>
                    <select
                      value={selectedDay}
                      onChange={handleDayChange}
                      required
                    >
                      <option value="" disabled>
                        Day
                      </option>
                      {Array.from({ length: days }, (_, i) => i + 1).map(
                        (day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className={styles.selectWrapper}>
                    <label htmlFor="year">Year</label>
                    <select
                      value={selectedYear}
                      onChange={handleYearChange}
                      required
                    >
                      <option value="" disabled>
                        Year
                      </option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  className={styles.registerSubmit}
                  type="button"
                  disabled={!isFormValid || isLoadingUsers}
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className={styles.passwordMessage}>
                Make sure it's 8 characters or more.
              </p>
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
              <p className={styles.agreement}>
                By signing up, you agree to the{" "}
                <span>
                  <Link href="#">Terms of Service</Link>
                </span>{" "}
                and{" "}
                <span>
                  <Link href="#">Privacy Policy</Link>
                </span>{" "}
                . including{" "}
                <span>
                  <Link href="#">Cookie Use</Link>
                </span>{" "}
                . X may use your contact information, including your email
                address and phone number for purposes outlined in our Privacy
                Policy, like keeping your account secure and personalizing our
                services, including ads.{" "}
                <span>
                  <Link href="#">Learn more</Link>
                </span>{" "}
                . Others will be able to find you by email or phone number, when
                provided, unless you choose otherwise{" "}
                <span>
                  <Link href="#">here</Link>
                </span>{" "}
                .
              </p>
              <button
                className={styles.registerSubmit}
                type="submit"
                disabled={!isFormValid2 || isLoadingUsers}
              >
                Sign Up
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
