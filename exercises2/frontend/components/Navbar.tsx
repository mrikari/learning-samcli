'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <nav style={styles.nav}>
        <div style={styles.container}>
          <div style={styles.brand}>アプリケーション</div>
          <div style={styles.userSection}>読み込み中...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link href="/" style={styles.brand}>
          アプリケーション
        </Link>
        
        <div style={styles.navigation}>
          <Link 
            href="/" 
            style={{
              ...styles.navLink,
              ...(pathname === '/' ? styles.activeNavLink : {})
            }}
          >
            ホーム
          </Link>
          <Link 
            href="/troubles" 
            style={{
              ...styles.navLink,
              ...(pathname === '/troubles' ? styles.activeNavLink : {})
            }}
          >
            課題管理
          </Link>
        </div>
        
        <div style={styles.userSection}>
          {user && (
            <>
              <span style={styles.userName}>
                {user.email || user.username}
              </span>
              <button
                onClick={logout}
                style={styles.logoutButton}
              >
                ログアウト
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '0 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px',
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    textDecoration: 'none',
  },
  navigation: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    fontSize: '16px',
    color: '#666',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'background-color 0.2s, color 0.2s',
  },
  activeNavLink: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '14px',
    color: '#666',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
}; 