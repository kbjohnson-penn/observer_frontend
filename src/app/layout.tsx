import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Provider } from "@/components/ui/provider";
import AppLayout from "./AppLayout";

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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Provider>
          <AppLayout>{children}</AppLayout>
        </Provider>
      </body>
    </html>
  );
}