"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function useActiveLink(href: string) {
  const pathname = usePathname();
  return pathname === href;
}

export default function Navigation() {
  return (
    <nav className="bg-nav-background">
      <header className="flex justify-between items-center w-full p-2">
        <div className="flex items-center pr-4 pt-1 pb-1">
          <Link href="https://www.med.upenn.edu/">
            <Image
              src="/psom_logo_white.svg"
              width={180}
              height={80}
              alt="Penn Medicine logo"
              className="h-12 ml-4"
              priority
            />
          </Link>
          <div className="h-12 border-r ml-4"></div>
          <div className="ml-4">
            <p className="text-sm text-white">
              Automating Healthcare Beyond Documentation
            </p>
          </div>
        </div>

        <ul className="flex justify-center space-x-4">
          <li>
            <Link
              href="/"
              className={`${
                useActiveLink("/")
                  ? "font-bold text-zinc-50"
                  : "font-semibold text-white text-zinc-400"
              } hover:text-yellow-500 mr-6`}
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
              } hover:text-yellow-500 mr-6`}
            >
              Dashboard
            </Link>
          </li>
        </ul>
      </header>
    </nav>
  );
}
