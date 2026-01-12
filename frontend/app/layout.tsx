import type React from "react";
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Removed as requested/used in user snippet (user snippet commented out font usage but imported it. I will keep imports but follow user snippet style which actually didn't use them in body classname dynamically, but kept imports. Wait, user snippet `_geist` unused. I will keep it clean).
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Navigation } from "@/components/nav";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaafSaksham - Clean Your City, Earn Real Rewards",
  description:
    "India's first verified civic-cleanliness micro-task marketplace. Complete tasks, earn tokens, and redeem real rewards while making an impact.",
  generator: "v0.app",
  keywords: ["civic cleanliness", "micro-tasks", "rewards", "India", "verified tasks", "gamification", "tokens", "CSR"],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <Navigation />
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
