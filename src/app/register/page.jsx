"use client";
import { useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";


export default function RegisterModal({closeModal}) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDay, setSelectedDay] = useState(""); 
  const [days, setDays] = useState(31);
  
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
        </div>
        <form>
          <div className={styles.formGroup}>
            <input type="text" id="name" placeholder="Name" required />
          </div>
          <div className={styles.formGroup}>
            <input type="email" id="email" placeholder="Email" required />
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
                  id="month"
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
                  {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <label htmlFor="year">Year</label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  id="year"
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
          </div>
          <button className={styles.registerSubmit} type="submit">
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
