"use client"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { APP_NAME } from "./constants/variables";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { handleRedirectResult } from "./services/firebase/authUtils";
import { ROUTES } from "./constants/path";
config.autoAddCss = false

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    // Process mobile redirect results here
    handleRedirectResult(
      () => router.push(ROUTES.garage),       // Existing user
      () => router.push(ROUTES.onboarding)    // New user
    );
  }, [router]);

  return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </div>
  );
}
