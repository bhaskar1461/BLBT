// src/app/profile/page.tsx
import React from 'react';
import type { Metadata } from 'next';
import PublicProfilePage from '@/app/u/[username]/page';

export const metadata: Metadata = {
  title: 'Bhaskar1461 Profile | TradingView Terminal',
  description: 'Official TradingView profile with verified paper trading track record, ideas, scripts, and cryptographic ledger proofs.',
};

export default async function MyProfilePage() {
  // Default to Bhaskar1461 profile as per user requirement
  return <PublicProfilePage params={{ username: 'Bhaskar1461' }} />;
}
