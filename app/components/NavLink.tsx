"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "./../../lib/utility";

interface NavLinkProps extends Omit<
  React.ComponentProps<typeof Link>,
  "href" | "className"
> {
  to: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  end?: boolean; // like react-router "end"
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    { to, className, activeClassName, pendingClassName, end = false, ...props },
    ref,
  ) => {
    const pathname = usePathname();

    const isActive = end
      ? pathname === to
      : pathname === to || pathname.startsWith(to + "/");

    return (
      <Link
        ref={ref}
        href={to}
        className={cn(
          className,
          isActive && activeClassName,
          // Next.js doesn't expose "isPending" directly like RR v6
          // so we leave pendingClassName optional
        )}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
