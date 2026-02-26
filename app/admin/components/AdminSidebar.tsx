"use client";
import {
  LayoutDashboard,
  Award,
  Users,
  Building2,
  FileCheck2Icon,
  FileCheck,
  Settings,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "./../../components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./../../components/ui/sidebar";
import { cn } from "./../../../lib/utility";

const mainNav = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { title: "Issue Certificate", url: "/admin/issue", icon: Award },
  {
    title: "Verify Certificate",
    url: "/admin/verify/certificates",
    icon: ShieldCheck,
  },
  {
    title: "Revoke Certificate",
    url: "/admin/revoke/certificates",
    icon: FileCheck,
  },
];

const manageNav = [
  {
    title: "Revoke Requests",
    url: "/admin/revoke/requests",
    icon: FileCheck2Icon,
  },
];

const bottomNav = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="h-14 flex items-center justify-start px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
              SkillChain
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 gap-0 ">
        {/* Main */}
        <SidebarGroup className="p-0 mb-4">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 mb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground transition-colors w-full",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 mb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Manage
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {manageNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground transition-colors w-full",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 py-3 border-t border-sidebar-border">
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground transition-colors w-full",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
