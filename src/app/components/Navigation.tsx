"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function useActiveLink(href: string) {
  const pathname = usePathname();
  return pathname === href;
}

export default function Navigation() {
  return (
    <ul className="flex justify-center space-x-4">
      <li>
        <Link
          href="/"
          className={`${
            useActiveLink("/")
              ? "font-bold text-zinc-50"
              : "font-semibold text-white text-zinc-400"
          } hover:text-yellow-500 ml-3 mr-4`}
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/dashboard"
          className={`${
            useActiveLink("/dashboard")
              ? "font-bold text-zinc-50"
              : "font-semibold text-white text-zinc-400"
          } hover:text-yellow-500 ml-3 mr-4`}
        >
          Dashboard
        </Link>
      </li>
    </ul>
  );
}
