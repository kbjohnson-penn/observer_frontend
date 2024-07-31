import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

config.autoAddCss = false;

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
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-72J257LTJR"
        ></Script>
        <Script>
          {`window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-72J257LTJR');`}
        </Script>
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navigation />
        <div className="mb-auto">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
