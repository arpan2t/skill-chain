"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, Search, Moon, Sun, Maximize2, Minimize2 } from "lucide-react";

export function AdminNavbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.includes("/certificates")) return "Issued Certificates";
    if (pathname.includes("/issue")) return "Issue Certificate";
    if (pathname.includes("/verify")) return "Verify Certificate";
    if (pathname.includes("/revoke")) return "Revoke Certificate";
    if (pathname.includes("/revocation-requests")) return "Revoke Requests";
    if (pathname.includes("/user/certificates"))
      return "My Issued Certificates";
    if (pathname.includes("/settings")) return "Settings";
    return "Admin Panel";
  };

  if (!mounted) return null;

  return (
    <header
      className={`fixed top-0 lg:top-0 left-0 right-0 lg:left-64 z-30 bg-gradient-to-r from-card/95 to-secondary/95 backdrop-blur-xl border-b border-border/50 transition-all duration-300 ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="px-4 md:px-6 h-16  flex items-center justify-between">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 rounded-full bg-secondary/50 border border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-secondary/80 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="hidden md:block p-2 hover:bg-secondary/80 rounded-lg transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>

          <button
            className="p-2 hover:bg-secondary/80 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
