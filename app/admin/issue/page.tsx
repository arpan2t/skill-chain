import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./../../../lib/auth";
import NftIssue from "./dashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return <NftIssue username={session.user.name} />;
}
