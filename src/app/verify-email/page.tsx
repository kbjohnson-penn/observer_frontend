import React from "react";
import VerifyEmailForm from "@/components/verify-email/VerifyEmailForm";

interface PageProps {
  searchParams: { token?: string };
}

export default function VerifyEmailPage({ searchParams }: PageProps) {
  const token = searchParams.token;

  return <VerifyEmailForm token={token || null} />;
}