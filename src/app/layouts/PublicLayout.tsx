'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingContactButton from '@/components/FloatingContactButton';
import { fetchCsrfToken } from '@/lib/apiClient';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Fetch CSRF token on mount for public operations (login, register, verify-email)
  useEffect(() => {
    fetchCsrfToken().catch(() => {
      // Silently fail - CSRF token will be fetched again if needed
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header showLinks={true} />

      <div className="flex-1 p-4 md:p-6 pt-24 md:pt-28 min-h-[calc(100vh-400px)]">{children}</div>

      <Footer />
      <FloatingContactButton />
    </div>
  );
}
