'use client';

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import Cookies from 'js-cookie';
import { AWS_CONFIG } from './aws-config';

// 認証トークンのCookieキー
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  ID_TOKEN: 'idToken',
} as const;

// Cognito User Pool のインスタンス
const userPool = new CognitoUserPool({
  UserPoolId: AWS_CONFIG.userPoolId,
  ClientId: AWS_CONFIG.userPoolClientId,
});

// 認証結果の型定義
export interface AuthResult {
  success: boolean;
  message: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
  };
  requiresNewPassword?: boolean;
  cognitoUser?: CognitoUser;
}

// ユーザー情報の型定義
export interface UserInfo {
  username: string;
  email?: string;
  attributes: Record<string, string>;
}

// ログイン処理（SRPフロー）
export const signIn = async (
  username: string,
  password: string
): Promise<AuthResult> => {
  return new Promise((resolve) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const tokens = {
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          idToken: session.getIdToken().getJwtToken(),
        };

        // トークンをCookieに保存
        storeTokens(tokens);

        resolve({
          success: true,
          message: 'ログインに成功しました',
          tokens,
        });
      },
      onFailure: (err) => {
        console.error('Sign in error:', err);
        resolve({
          success: false,
          message: err.message || 'ログインに失敗しました',
        });
      },
      newPasswordRequired: () => {
        resolve({
          success: false,
          message: '新しいパスワードの設定が必要です',
          requiresNewPassword: true,
          cognitoUser: cognitoUser,
        });
      },
      mfaRequired: () => {
        resolve({
          success: false,
          message: 'MFA認証が必要です',
        });
      },
    });
  });
};

// 新しいパスワードの設定処理
export const completeNewPassword = async (
  cognitoUser: CognitoUser,
  newPassword: string
): Promise<AuthResult> => {
  return new Promise((resolve) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (session: CognitoUserSession) => {
        const tokens = {
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          idToken: session.getIdToken().getJwtToken(),
        };

        // トークンをCookieに保存
        storeTokens(tokens);

        resolve({
          success: true,
          message: 'パスワードが正常に設定されました',
          tokens,
        });
      },
      onFailure: (err) => {
        console.error('New password error:', err);
        resolve({
          success: false,
          message: err.message || 'パスワード設定に失敗しました',
        });
      },
    });
  });
};

// ログアウト処理
export const signOut = () => {
  // 現在のユーザーをサインアウト
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }

  // Cookieからトークンを削除
  Cookies.remove(TOKEN_KEYS.ACCESS_TOKEN);
  Cookies.remove(TOKEN_KEYS.REFRESH_TOKEN);
  Cookies.remove(TOKEN_KEYS.ID_TOKEN);
};

// トークンの保存
const storeTokens = (tokens: {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}) => {
  // Secure Cookieとして保存（HTTPS環境で使用）
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    expires: 1, // 1日
  };

  Cookies.set(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken, cookieOptions);
  Cookies.set(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken, {
    ...cookieOptions,
    expires: 30, // リフレッシュトークンは30日
  });
  Cookies.set(TOKEN_KEYS.ID_TOKEN, tokens.idToken, cookieOptions);
};

// アクセストークンの取得
export const getAccessToken = (): string | undefined => {
  const token = Cookies.get(TOKEN_KEYS.ACCESS_TOKEN);
  console.log('🍪 getAccessToken: Cookieから取得 =', token ? `${token.substring(0, 20)}...` : 'undefined');
  return token;
};

// IDトークンの取得
export const getIdToken = (): string | undefined => {
  const token = Cookies.get(TOKEN_KEYS.ID_TOKEN);
  console.log('🪪 getIdToken: Cookieから取得 =', token ? `${token.substring(0, 20)}...` : 'undefined');
  return token;
};

// 認証状態の確認
export const isAuthenticated = (): boolean => {
  const idToken = getIdToken();
  console.log('🔐 isAuthenticated: IDトークン =', idToken ? '存在' : '未設定');
  console.log('🔐 isAuthenticated: 認証状態 =', !!idToken);
  return !!idToken;
};

// ユーザー情報の取得
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  return new Promise((resolve) => {
    const currentUser = userPool.getCurrentUser();
    
    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession((err: any, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        signOut();
        resolve(null);
        return;
      }

      currentUser.getUserAttributes((err: any, attributes: CognitoUserAttribute[] | undefined) => {
        if (err) {
          console.error('Get user attributes error:', err);
          resolve(null);
          return;
        }

        const attributesMap: Record<string, string> = {};
        attributes?.forEach((attr) => {
          if (attr.Name && attr.Value) {
            attributesMap[attr.Name] = attr.Value;
          }
        });

        resolve({
          username: currentUser.getUsername(),
          email: attributesMap['email'],
          attributes: attributesMap,
        });
      });
    });
  });
};

// トークンの更新（リフレッシュ）
export const refreshToken = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const currentUser = userPool.getCurrentUser();
    
    if (!currentUser) {
      resolve(false);
      return;
    }

    currentUser.getSession((err: any, session: CognitoUserSession | null) => {
      if (err || !session) {
        signOut();
        resolve(false);
        return;
      }

      if (session.isValid()) {
        resolve(true);
        return;
      }

      const refreshTokenValue = session.getRefreshToken();
      
      currentUser.refreshSession(refreshTokenValue, (err: any, newSession: CognitoUserSession) => {
        if (err) {
          console.error('Refresh token error:', err);
          signOut();
          resolve(false);
          return;
        }

        const tokens = {
          accessToken: newSession.getAccessToken().getJwtToken(),
          refreshToken: newSession.getRefreshToken().getToken(),
          idToken: newSession.getIdToken().getJwtToken(),
        };

        storeTokens(tokens);
        resolve(true);
      });
    });
  });
}; 