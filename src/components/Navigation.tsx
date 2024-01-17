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
      <header className="flex justify-between items-center w-full p-4">
        <div className="flex items-center pr-4">
          <Link href="https://www.med.upenn.edu/">
            <Image
              src="/penn-med.png"
              width={180}
              height={100}
              alt="Observer logo"
              className="h-12 ml-4"
              priority
            />
          </Link>
          <div className="h-12 border-r ml-4"></div>
          <div className="ml-4">
            <Link href="https://www.med.upenn.edu/observer/">
              <Image
                src="/observer-light.png"
                width={200}
                height={100}
                alt="Observer logo"
                className="h-12"
                priority
              />
              <p className="mt-2 text-sm text-white">
                A Digital Window into Medicine
              </p>
            </Link>
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
              } hover:text-yellow-500 ml-3 mr-4 text-lg`}
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
              } hover:text-yellow-500 ml-3 mr-4 text-lg`}
            >
              Dashboard
            </Link>
          </li>
        </ul>
      </header>
    </nav>
  );
}
