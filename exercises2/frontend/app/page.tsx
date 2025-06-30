'use client';

import { useAuth } from "../components/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>ようこそ!</h1>
        
        {user && (
          <div style={styles.userInfo}>
            <h2 style={styles.subtitle}>ユーザー情報</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <strong>ユーザー名:</strong> {user.username}
              </div>
              {user.email && (
                <div style={styles.infoItem}>
                  <strong>メールアドレス:</strong> {user.email}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={styles.description}>
          <p>AWS Cognitoによる認証が正常に動作しています。</p>
          <p>このページにアクセスするには認証が必要です。</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  content: {
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '20px',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '30px',
    border: '1px solid #dee2e6',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    alignItems: 'center',
  },
  infoItem: {
    fontSize: '16px',
    color: '#666',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
  },
};
