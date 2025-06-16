'use client';

import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import UserList from '@/components/Users/UserList';

export default function UsersPage() {
  return (
    <AppLayout>
      <UserList />
    </AppLayout>
  );
} 