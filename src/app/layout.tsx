import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Observer Platform",
  description: "A Digital Window into Medicine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-nav-background">
          <header className="flex justify-between items-center w-full p-4">
            <div className="flex items-center pr-4">
              <Link href="https://www.med.upenn.edu/">
                <img
                  src="/penn-med.png"
                  alt="Observer logo"
                  className="h-12 ml-4"
                />
              </Link>
              <div className="h-12 border-r ml-4"></div>
              <div className="ml-4">
                <Link href="https://www.med.upenn.edu/observer/">
                  <img
                    src="/observer-logo.png"
                    alt="Observer logo"
                    className="h-12"
                  />
                  <p className="mt-2 text-sm text-white">
                    A Digital Window into Medicine
                  </p>
                </Link>
              </div>
            </div>
            <Navigation />
          </header>
        </nav>
        {children}
      </body>
    </html>
  );
}
