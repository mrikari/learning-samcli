'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated } from '../libs/auth';

interface ClientAuthGuardProps {
  children: React.ReactNode;
}

export default function ClientAuthGuard({ children }: ClientAuthGuardProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const checkAuth = async () => {
        try {
          console.log('🔍 ClientAuthGuard: 認証チェック開始');
          
          // 少し遅延を入れてCookieが確実に読み取れるようにする
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const authStatus = isAuthenticated();
          console.log('🔐 ClientAuthGuard: 認証状態 =', authStatus);
          
          if (!authStatus) {
            const currentPath = window.location.pathname;
            const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
            console.log('❌ ClientAuthGuard: 未認証、ネイティブリダイレクト実行 =', loginUrl);
            
            // SSG環境では window.location.href を使用
            window.location.href = loginUrl;
            return;
          }
          
          console.log('✅ ClientAuthGuard: 認証済み、ページ表示');
          setIsUserAuthenticated(true);
          setIsAuthChecked(true);
        } catch (error) {
          console.error('🚨 ClientAuthGuard: 認証チェックエラー:', error);
          window.location.href = '/login';
        }
      };

      checkAuth();
    }
  }, [isClient]);

  // サーバーサイドレンダリング中は何も表示しない（ハイドレーション問題を避ける）
  if (!isClient) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  // クライアント側で認証チェック中は読み込み表示
  if (!isAuthChecked || !isUserAuthenticated) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p>認証を確認中...</p>
        </div>
      </div>
    );
  }

  // 認証済みの場合のみ子要素を表示
  return <>{children}</>;
}

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  loadingContent: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
}; 