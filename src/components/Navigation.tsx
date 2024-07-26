"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function useActiveLink(href: string) {
  const pathname = usePathname();
  return pathname === href;
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-nav-background">
      <header className="flex justify-between items-center w-full p-4">
        <div className="flex items-center">
          <Link href="https://www.med.upenn.edu/">
            <Image
              src="/ObserverLogoDarkBackground.svg"
              width={160}
              height={80}
              alt="Penn Medicine logo"
              className="h-12 ml-4"
              priority
            />
          </Link>
          <div className="hidden md:flex items-center ml-4">
            <div className="h-12 border-r border-gray-300"></div>
            <p className="text-sm text-white ml-4">
              Automating Healthcare Beyond Documentation
            </p>
          </div>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        <ul className="hidden md:flex items-center space-x-8">
          <li>
            <Link
              href="/"
              className={`${
                useActiveLink("/")
                  ? "font-bold text-zinc-50"
                  : "font-semibold text-zinc-400"
              } hover:text-yellow-500`}
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
                  : "font-semibold text-zinc-400"
              } hover:text-yellow-500`}
            >
              Dashboard
            </Link>
          </li>
        </ul>
      </header>

      {isMenuOpen && (
        <ul className="md:hidden flex flex-col bg-nav-background border-t border-gray-700">
          <li>
            <Link
              href="/"
              className={`block px-4 py-2 ${
                useActiveLink("/")
                  ? "font-bold text-zinc-50"
                  : "font-semibold text-zinc-400"
              } hover:text-yellow-500`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className={`block px-4 py-2 ${
                useActiveLink("/dashboard")
                  ? "font-bold text-zinc-50"
                  : "font-semibold text-zinc-400"
              } hover:text-yellow-500`}
            >
              Dashboard
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
