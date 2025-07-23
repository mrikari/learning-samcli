'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import ClientAuthGuard from './ClientAuthGuard';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <ClientAuthGuard>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 60px)' }}>
        {children}
      </main>
    </ClientAuthGuard>
  );
} 