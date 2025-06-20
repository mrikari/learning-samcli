'use client';

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import TroubleList from '@/components/Troubles/TroubleList';

export default function HomePage() {
  return (
    <AppLayout>
      <TroubleList />
    </AppLayout>
  );
}
