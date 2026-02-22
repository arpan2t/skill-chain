import { SidebarProvider, SidebarInset } from "./../components/ui/sidebar";
import { AppSidebar } from "./components/AdminSidebar";
import { AdminNavbar } from "./components/AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <AdminNavbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
