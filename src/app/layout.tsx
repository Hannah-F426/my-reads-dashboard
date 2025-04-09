"use client"

import Link from "next/link";
import { usePathname } from "next/navigation"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {motion} from "framer-motion";
import {BookOpen} from "lucide-react";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <nav>
          <div className="topnav">
              <div className="topnav-centered">
                  <Link href="/"
                        className={pathname === "/" ? "font-bold mr-4" : "text-yellow-500 mr-4"}>Home</Link>
                  <Link href="/dashboard"
                        className={pathname === "/dashboard" ? "font-bold mr-4" : "text-yellow-500 mr-4"}>Dashboard</Link>
              </div>
          </div>
      </nav>
      {children}
      </body>
    </html>
  );
}
