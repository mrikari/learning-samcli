'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { signIn, isAuthenticated } from '../../libs/auth';
import { useAuth } from '../../components/AuthProvider';
import NewPasswordForm from '../../components/NewPasswordForm';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { refreshUser } = useAuth();

  // 既に認証済みの場合はリダイレクト
  useEffect(() => {
    console.log('📄 LoginPage: ログインページ表示');
    console.log('📄 LoginPage: リダイレクト先（設定済み） =', redirectPath);
    
    const authStatus = isAuthenticated();
    console.log('📄 LoginPage: 認証状態チェック =', authStatus);
    
    if (authStatus) {
      console.log('✅ LoginPage: 認証済み、リダイレクト実行 =>', redirectPath);
      window.location.href = redirectPath;
    } else {
      console.log('❌ LoginPage: 未認証、ログインフォーム表示');
    }
  }, [redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(username, password);
      
      if (result.success) {
        // ログイン成功時はユーザー情報を更新してからリダイレクト
        await refreshUser();
        window.location.href = redirectPath;
      } else if (result.requiresNewPassword && result.cognitoUser) {
        // パスワード変更が必要な場合
        setRequiresNewPassword(true);
        setCognitoUser(result.cognitoUser);
        setError('');
      } else {
        setError(result.message);
      }
    } catch {
      setError('ログイン中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSuccess = async () => {
    // パスワード設定成功時はユーザー情報を更新してからリダイレクト
    await refreshUser();
    window.location.href = redirectPath;
  };

  const handleNewPasswordCancel = () => {
    // パスワード設定をキャンセルしてログインフォームに戻る
    setRequiresNewPassword(false);
    setCognitoUser(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  // パスワード変更が必要な場合は専用フォームを表示
  if (requiresNewPassword && cognitoUser) {
    return (
      <NewPasswordForm
        cognitoUser={cognitoUser}
        onSuccess={handleNewPasswordSuccess}
        onCancel={handleNewPasswordCancel}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>ログイン</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>
              ユーザー名 / メールアドレス
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="ユーザー名またはメールアドレスを入力"
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="パスワードを入力"
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              ...styles.button,
              ...(loading || !username || !password ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

// インラインスタイル
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '30px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    textAlign: 'center' as const,
    padding: '10px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
  },
}; 