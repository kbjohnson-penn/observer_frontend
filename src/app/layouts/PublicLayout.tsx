"use client";

import React from "react";
import TopNavigation from "@/components/navigation/TopNavigation";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavigation />
      <main className="min-h-[calc(100vh-300px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}