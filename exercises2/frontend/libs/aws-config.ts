// AWS Cognito設定
export const AWS_CONFIG = {
  // AWS地域（例: us-east-1, ap-northeast-1）
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1',
  
  // Cognito User Pool設定
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || '',
  
  // 認証設定（SRPフローのみ使用）
  authFlow: 'USER_SRP_AUTH' as const,
};

// 環境変数の検証
export const validateConfig = () => {
  const missingVars = [];
  
  if (!AWS_CONFIG.userPoolId) {
    missingVars.push('NEXT_PUBLIC_COGNITO_USER_POOL_ID');
  }
  
  if (!AWS_CONFIG.userPoolClientId) {
    missingVars.push('NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID');
  }
  
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
}; 