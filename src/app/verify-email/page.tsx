import React from 'react';
import VerifyEmailForm from '@/components/verify-email/VerifyEmailForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  return <VerifyEmailForm token={token || null} />;
}
