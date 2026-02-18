import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "./providers";
import { WalletButton } from "./components/WalletButton";
import { GraduationCap, Link } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillChain",
  description: "Verifiable academic credentials on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletContextProvider>
          <div className="min-h-screen bg-background text-foreground">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <span className="text-lg font-semibold">SkillChain</span>
                </a>
                <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                  <a
                    href="/#features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="/#about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                  <a
                    href="/#contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                  <a
                    href="/profile"
                    className="hover:text-foreground transition-colors"
                  >
                    Profile
                  </a>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <WalletButton />
                  <Link href={session ? "/admin/issue" : "/login"}>
                    <button className="!bg-[#112833] rounded-sm  !px-6 !py-3 !text-white !font-semibold !transition-all hover:!bg-[#0e2c3b] hover:!scale-105 hover:!shadow-lg ">
                      {session ? "Issue" : "Login"}
                    </button>
                  </Link>
                </div>
              </div>
            </nav>

            {children}
            <footer id="contact" className="py-10 px-6 border-t border-border">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">SkillChain</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  © 2026 SkillChain. All rights reserved.
                </p>
                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Discord
                  </a>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
