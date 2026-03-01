"use client";
import { Bell, Search, GraduationCap } from "lucide-react";
import { SidebarTrigger } from "./../../components/ui/sidebar";
import { useSession } from "next-auth/react";

export function AdminNavbar() {
  const { data: session, status } = useSession();
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        <div className="h-4 w-px bg-border hidden sm:block" />
      </div>
      <div className="hidden md:flex items-center gap-2 max-w-xs w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        <button className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg hover:bg-accent transition-colors">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-primary-foreground">
              {session?.user?.name?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-foreground leading-none">
              {session?.user?.name}
            </p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              {session?.user?.email}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
