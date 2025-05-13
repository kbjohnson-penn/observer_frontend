"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header variant="full" showLinks={true} />

      <div className="flex-1 p-4 md:p-6 pt-24 md:pt-28 min-h-[calc(100vh-400px)]">
        {children}
      </div>

      <Footer variant="full" />
    </div>
  );
}
