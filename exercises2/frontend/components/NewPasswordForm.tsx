'use client';

import { useState } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { completeNewPassword } from '../libs/auth';

interface NewPasswordFormProps {
  cognitoUser: CognitoUser;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
}

export default function NewPasswordForm({ cognitoUser, onSuccess, onCancel }: NewPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // パスワードの確認
    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    // パスワードの強度チェック（Cognitoのデフォルト要件）
    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      setLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('パスワードには大文字、小文字、数字を含める必要があります');
      setLoading(false);
      return;
    }

    try {
      const result = await completeNewPassword(cognitoUser, newPassword);
      
      if (result.success) {
        await onSuccess();
      } else {
        setError(result.message);
      }
    } catch {
      setError('パスワード設定中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.title}>新しいパスワードの設定</h1>
        <p style={styles.description}>
          セキュリティのため、新しいパスワードを設定してください。
        </p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="newPassword" style={styles.label}>
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="新しいパスワードを入力"
            />
            <div style={styles.requirements}>
              <small>
                要件: 8文字以上、大文字・小文字・数字を含む
              </small>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              パスワード確認
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="パスワードを再入力"
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onCancel}
              style={styles.cancelButton}
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              style={{
                ...styles.submitButton,
                ...(loading || !newPassword || !confirmPassword ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? '設定中...' : 'パスワードを設定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  formBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '10px',
    color: '#333',
  },
  description: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '30px',
    lineHeight: '1.5',
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
  requirements: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButton: {
    flex: 1,
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