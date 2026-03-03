import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import IssuedCertificates from "./IssuedCertificate";

export default async function IssuedCertificatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <IssuedCertificates session={session} />;
}
