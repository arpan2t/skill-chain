import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import AdminDashboardClient from "./AdminDashboard";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const adminId = Number(session.user.id);

  const [totalCertificates, totalRecipients, activeThisMonth, recentActivity] =
    await Promise.all([
      prisma.certificate.count({
        where: {
          issuedById: adminId,
        },
      }),

      prisma.certificate
        .findMany({
          where: {
            issuedById: adminId,
          },
          select: { destination_wallet: true },
          distinct: ["destination_wallet"],
        })
        .then((results) => results.length),

      prisma.certificate.count({
        where: {
          issuedById: adminId,
          mintedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      prisma.certificate.findMany({
        where: {
          issuedById: adminId,
        },
        take: 5,
        orderBy: { mintedAt: "desc" },
        include: {
          issuedBy: {
            select: { name: true },
          },
        },
      }),
    ]);

  const totalVerifications = totalCertificates;

  const formattedActivity = recentActivity.map((cert, index) => {
    let iconName = "Award";
    let color = "text-primary";
    let bg = "bg-primary/10";

    if (index % 3 === 1) {
      iconName = "CheckCircle2";
      color = "text-emerald-400";
      bg = "bg-emerald-400/10";
    } else if (index % 3 === 2) {
      iconName = "Clock";
      color = "text-amber-400";
      bg = "bg-amber-400/10";
    } else {
      iconName = "Award";
      color = "text-primary";
      bg = "bg-primary/10";
    }

    return {
      id: cert.id,
      type:
        index % 3 === 0 ? "issued" : index % 3 === 1 ? "verified" : "pending",
      name: cert.title || "Untitled Certificate",
      recipient:
        cert.destination_wallet.slice(0, 6) +
        "..." +
        cert.destination_wallet.slice(-4),
      time: getTimeAgo(cert.mintedAt),
      iconName,
      color,
      bg,
    };
  });

  const stats = [
    {
      label: "Certificates Issued",
      value: totalCertificates.toLocaleString(),
      iconName: "Award",
    },
    {
      label: "Total Recipients",
      value: totalRecipients.toLocaleString(),
      iconName: "Users",
    },
    {
      label: "Verifications",
      value: totalVerifications.toLocaleString(),
      iconName: "ShieldCheck",
    },
    {
      label: "Active This Month",
      value: activeThisMonth.toLocaleString(),
      iconName: "TrendingUp",
    },
  ];

  const quickActions = [
    {
      label: "Issue New Certificate",
      iconName: "Award",
      primary: true,
      href: "/admin/issue",
    },
    {
      label: "Verify a Certificate",
      iconName: "ShieldCheck",
      href: "/admin/verify/certificates",
    },
    {
      label: "Manage Recipients",
      iconName: "Users",
      href: "/admin/issued/certificates",
    },
  ];

  return (
    <AdminDashboardClient
      stats={stats}
      recentActivity={formattedActivity}
      quickActions={quickActions}
    />
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
