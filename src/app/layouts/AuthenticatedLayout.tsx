"use client";

import React from "react";
import Sidebar from "@/components/navigation/Sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="ml-[250px] p-6 transition-all duration-300 md:ml-[250px] sm:ml-[70px]">
        {children}
      </main>
    </>
  );
}