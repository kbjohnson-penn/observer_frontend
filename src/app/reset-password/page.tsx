import React from 'react';
import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  return <ResetPasswordForm token={token || null} />;
}
