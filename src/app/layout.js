"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider, useSession } from "next-auth/react";
import "@/app/page.module.css";
import Navbar from "./components/Navbar/page";
import Sidebar from "./components/Sidebar/page";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const hideNavbarAndSidebar = pathname === "/";
  const hideRightContainer = pathname.startsWith("/messages");
  const hideAll = pathname.startsWith("/api-doc");

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      {!hideAll && !hideNavbarAndSidebar && session && (
        <div className="leftcontainer">
          <Navbar />
        </div>
      )}

      <div className="middlecontainer">{children}</div>
      {!hideAll && !hideNavbarAndSidebar && !hideRightContainer && session && (
        <div className="rightcontainer">
          <Sidebar />
        </div>
      )}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <LayoutContent>{children}</LayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}
