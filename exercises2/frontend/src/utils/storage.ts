'use client';

import Cookies from 'js-cookie';

// トークンのキー名
const TOKEN_KEY = 'idToken';

// トークンを取得
export const getToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null;
};

// トークンを設定
export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7日間有効
    secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPSのみ
    sameSite: 'strict',
  });
};

// トークンを削除
export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};

// クライアントサイドでのみ実行
if (typeof window !== 'undefined') {
  global.localStorage.getItem('idToken');
} 