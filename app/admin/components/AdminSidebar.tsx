"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Award,
  Users,
  FileText,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  AlertCircle,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  Grid,
  Layers,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mainNavItems: NavSection = {
    title: "MAIN",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Issue Certificate", href: "/admin/issue", icon: FileText },
      {
        title: "Verify Certificate",
        href: "/admin/verify/certificates",
        icon: Shield,
      },
      {
        title: "Revoke Certificate",
        href: "/admin/revoke/certificates",
        icon: AlertCircle,
      },
    ],
  };

  const manageNavItems: NavSection = {
    title: "MANAGE",
    items: [
      {
        title: "Issued Certificates",
        href: "/admin/issued/certificates",
        icon: Award,
      },
      {
        title: "Revoke Requests",
        href: "/admin/revoke/requests",
        icon: AlertCircle,
      },
    ],
  };

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
        setMobileOpen(false);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;

    if (pathname === href) return true;

    return pathname.startsWith(href + "/");
  };

  if (!mounted) return null;

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-card/95 to-secondary/95 backdrop-blur-xl border-b border-border/50 z-40 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-secondary/80 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
            Organization
          </span>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 lg:top-0 h-full w-64 lg:w-64 z-50
          bg-gradient-to-b from-card to-secondary/95 backdrop-blur-xl
          border-r border-border/50
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          shadow-2xl lg:shadow-none
          overflow-y-auto
        `}
      >
        {/* Organization Logo/Name - Desktop */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
              {session?.user?.name || "Organization Name"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {session?.user?.email || "admin@org.com"}
            </p>
          </div>
        </div>

        {/* User Info - Mobile */}
        <div className="lg:hidden p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "Admin User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {/* MAIN Section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 tracking-wider">
              {mainNavItems.title}
            </p>
            <div className="space-y-1">
              {mainNavItems.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group relative
                    ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* MANAGE Section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 tracking-wider">
              {manageNavItems.title}
            </p>
            <div className="space-y-1">
              {manageNavItems.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group relative
                    ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-left">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className="lg:ml-64">
        <div className="lg:hidden h-16" />
      </div>
    </>
  );
}
