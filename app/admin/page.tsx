import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminDashboard from "./dashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  } else if (session.user.user_type !== 0) {
    redirect("/");
  }
  return <AdminDashboard username={session.user.name} />;
}
