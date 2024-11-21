"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";

const NavigationContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Ensure this renders only on the client
  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    logout(); // Call the logout function
    setIsMenuOpen(false); // Close the mobile menu if open
  };

  if (!isReady) return null; // Prevent rendering on the server

  return (
    <nav className="bg-nav-background">
      <header className="flex justify-between items-center w-full p-4">
        {/* Logo and Tagline */}
        <div className="flex items-center">
          <Link href="https://www.med.upenn.edu/">
            <Image
              src="/ObserverLogoDarkBackground.svg"
              width={220}
              height={80}
              alt="Penn Medicine logo"
              className="h-12 ml-2"
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

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center space-x-8">
          {!isAuthenticated && (
            <li>
              <Link
                href="/"
                className={`${
                  location.pathname === "/"
                    ? "font-bold text-zinc-50"
                    : "font-semibold text-zinc-400"
                } hover:text-yellow-500`}
              >
                Home
              </Link>
            </li>
          )}
          <li>
            <Link
              href={isAuthenticated ? "/dashboard" : "/dashboard-public"}
              className={`${
                location.pathname === "/dashboard" ||
                location.pathname === "/dashboard-public"
                  ? "font-bold text-zinc-50"
                  : "font-semibold text-zinc-400"
              } hover:text-yellow-500`}
            >
              {isAuthenticated ? "Dashboard" : "Dashboard"}
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link
                href="/profile"
                className={`${
                  location.pathname === "/profile"
                    ? "font-bold text-zinc-50"
                    : "font-semibold text-zinc-400"
                } hover:text-yellow-500`}
              >
                Profile
              </Link>
            </li>
          )}
          <li>
            {isAuthenticated ? (
              <Link
                href="#"
                onClick={handleLogout}
                className="font-semibold text-zinc-400 hover:text-yellow-500"
              >
                Logout
              </Link>
            ) : (
              <Link
                href="/login"
                className="font-semibold text-zinc-400 hover:text-yellow-500"
              >
                Login
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(!isMenuOpen);
            }}
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
          </Link>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <ul className="md:hidden flex flex-col bg-nav-background border-t border-gray-700">
          <li>
            <Link
              href="/"
              className={`block px-4 py-2 ${
                location.pathname === "/"
                  ? "font-bold text-zinc-50"
                  : "font-semibold text-zinc-400"
              } hover:text-yellow-500`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href={isAuthenticated ? "/dashboard" : "/dashboard-public"}
              className={`block px-4 py-2 ${
                location.pathname === "/dashboard" ||
                location.pathname === "/dashboard-public"
                  ? "font-bold text-zinc-50"
                  : "font-semibold text-zinc-400"
              } hover:text-yellow-500`}
            >
              {isAuthenticated ? "Dashboard" : "Dashboard"}
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link
                href="/profile"
                className={`block px-4 py-2 ${
                  location.pathname === "/profile"
                    ? "font-bold text-zinc-50"
                    : "font-semibold text-zinc-400"
                } hover:text-yellow-500`}
              >
                Profile
              </Link>
            </li>
          )}
          <li>
            {isAuthenticated ? (
              <Link
                href="#"
                onClick={handleLogout}
                className="block px-4 py-2 text-zinc-400 hover:text-yellow-500"
              >
                Logout
              </Link>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 text-zinc-400 hover:text-yellow-500"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
};

export default NavigationContent;
