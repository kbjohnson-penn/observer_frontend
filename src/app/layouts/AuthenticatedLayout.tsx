"use client";

import React from "react";
import Sidebar from "@/components/navigation/Sidebar";
import Footer from "@/components/Footer";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1 ml-[70px] md:ml-[250px] transition-[margin-left] duration-300 ease">
        <div className="flex-1 p-4 md:p-6 min-h-[calc(100vh-100px)]">
          {children}
        </div>

        <Footer variant="compact" />
      </div>
    </div>
  );
}
