import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import IssuerRequestsClient from "./IssuerRequestsClient";

export default async function RevokeRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <IssuerRequestsClient session={session} />;
}
