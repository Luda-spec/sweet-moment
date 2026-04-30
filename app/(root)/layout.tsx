import type { Metadata } from 'next';
import React from 'react';

import { Providers } from '@/components/shared/providers';

export const metadata: Metadata = {
  title: 'Sweet moment',
  description: 'Где каждый повод становится особенным',
};

interface Props {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: Props) {
  return (
    <main className="min-h-screen bg-white">
      {children}

      <Providers />
    </main>
  );
}