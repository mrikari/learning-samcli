'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { authenticateUser } from '@/utils/auth';
import { setToken } from '@/utils/storage';

const Login: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');

  // パスワード変更用の状態
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  useEffect(() => {
    const from = searchParams.get('from');
    if (from) {
      setRedirectPath(from);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authenticateUser(username, password);
      
      // パスワード変更が必要な場合
      if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setShowChangePassword(true);
        return;
      }

      // 通常のログイン成功
      setToken(result.idToken);
      router.push(redirectPath);
    } catch (err) {
      setError('ログインに失敗しました');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setChangePasswordError('');

    // パスワードの一致確認
    if (newPassword !== confirmPassword) {
      setChangePasswordError('パスワードが一致しません');
      return;
    }

    // パスワードの要件チェック
    if (newPassword.length < 8) {
      setChangePasswordError('パスワードは8文字以上である必要があります');
      return;
    }

    try {
      const result = await authenticateUser(username, password, newPassword);
      setToken(result.idToken);
      setShowChangePassword(false);
      router.push(redirectPath);
    } catch (err) {
      setChangePasswordError('パスワードの変更に失敗しました');
      console.error('Change password error:', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            ログイン
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="ユーザー名"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* パスワード変更ダイアログ */}
      <Dialog open={showChangePassword} onClose={() => {}}>
        <DialogTitle>パスワードの変更が必要です</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="新しいパスワード"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="新しいパスワード（確認）"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {changePasswordError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {changePasswordError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangePassword} color="primary">
            パスワードを変更
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 