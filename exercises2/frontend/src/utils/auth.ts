import { cognitoClient } from '../config/aws-config';
import { 
  InitiateAuthCommand, 
  AuthFlowType,
  GetUserCommand 
} from '@aws-sdk/client-cognito-identity-provider';
import { getToken, setToken, removeToken } from './storage';
import { CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import UserPool from '@/lib/cognito';

export const login = async (username: string, password: string) => {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);
    if (response.AuthenticationResult?.IdToken) {
      setToken(response.AuthenticationResult.IdToken);
    }
    return response.AuthenticationResult;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) return null;

    const command = new GetUserCommand({
      AccessToken: token,
    });

    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

interface AuthResult {
  idToken: string;
  challengeName?: string;
}

export const authenticateUser = async (
  username: string,
  password: string,
  newPassword?: string
): Promise<AuthResult> => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: username,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve({
          idToken: session.getIdToken().getJwtToken(),
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        if (!newPassword) {
          resolve({
            idToken: '',
            challengeName: 'NEW_PASSWORD_REQUIRED',
          });
          return;
        }

        // パスワード変更を実行
        user.completeNewPasswordChallenge(newPassword, userAttributes, {
          onSuccess: (session: CognitoUserSession) => {
            resolve({
              idToken: session.getIdToken().getJwtToken(),
            });
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      },
    });
  });
}; 