"use client";
import { SidebarProvider, SidebarInset } from "./../components/ui/sidebar";
import { AppSidebar } from "./components/AdminSidebar";
import { AdminNavbar } from "./components/AdminNavbar";
import { useIsMobile } from "./../../hooks/useMobile";
import * as React from "react";
import { SessionProvider } from "next-auth/react";
const MEDIUM_BREAKPOINT = 1024;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: AdminLayoutProps) {
  const [defaultOpen, setDefaultOpen] = React.useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= MEDIUM_BREAKPOINT;
    }
    return true;
  });

  return (
    <SessionProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1 min-w-0">
            <AdminNavbar />
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
