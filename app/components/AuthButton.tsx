"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function AuthButton({ session }: { session: any }) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");

  if (!session) {
    return (
      <Link href="/login">
        <button className="bg-primary rounded-sm !px-6 !py-3 !text-white !font-semibold !transition-all hover:!bg-[#0e2c3b] hover:!scale-105 hover:!shadow-lg">
          Login
        </button>
      </Link>
    );
  }

  if (isAdminRoute) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="bg-red-600 rounded-sm !px-6 !py-3 !text-white !font-semibold !transition-all hover:!bg-red-700 hover:!scale-105 hover:!shadow-lg"
      >
        Sign Out
      </button>
    );
  }

  return (
    <Link href="/admin/issue">
      <button className="bg-primary rounded-sm !px-6 !py-3 !text-white !font-semibold !transition-all hover:!bg-[#0e2c3b] hover:!scale-105 hover:!shadow-lg">
        Issue
      </button>
    </Link>
  );
}
