import { getIdToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const COMMENTS_API_URL = process.env.NEXT_PUBLIC_COMMENTS_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL environment variable is required. ' +
    'Please add it to your .env.local file.'
  );
}

if (!COMMENTS_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_COMMENTS_API_URL environment variable is required. ' +
    'Please add it to your .env.local file.'
  );
}

// APIエラーのカスタムクラス
export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// 共通のAPI呼び出し関数
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL!
): Promise<T> {
  const idToken = getIdToken();
  
  if (!idToken) {
    throw new APIError(401, '認証トークンがありません');
  }

  const url = `${baseUrl}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log('🌐 API呼び出し:', { method: config.method || 'GET', url, hasAuth: !!idToken });

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ APIエラー:', { status: response.status, statusText: response.statusText, body: errorText });
      throw new APIError(response.status, `API呼び出しに失敗しました: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API成功:', data);
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    console.error('🚨 ネットワークエラー:', error);
    throw new APIError(500, `ネットワークエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 課題アイテムの型定義（APIレスポンスに合わせて調整）
export interface TroubleItem {
  item_id: string;
  category: string;
  message: string;
}

// 課題一覧取得のレスポンス型
export interface ListTroublesResponse {
  items: TroubleItem[];
  nextToken?: string;
}

// 課題作成のリクエスト型
export interface CreateTroubleRequest {
  category: string;
  message: string;
}

// 課題作成のレスポンス型
export interface CreateTroubleResponse {
  message: string;
  item_id: string;
  category: string;
}

// コメントアイテムの型定義
export interface CommentItem {
  PK: string;
  SK: string;
  user_id: string;
  comment: string;
}

// コメント作成のリクエスト型
export interface CreateCommentRequest {
  trouble_id: string;
  comment: string;
}

// 課題関連のAPI関数
export const troubleAPI = {
  // 課題一覧を取得
  async listTroubles(nextToken?: string): Promise<ListTroublesResponse> {
    const params = new URLSearchParams();
    if (nextToken) {
      params.append('nextToken', nextToken);
    }
    
    const endpoint = `/troubles${params.toString() ? `?${params.toString()}` : ''}`;
    return apiCall<ListTroublesResponse>(endpoint);
  },

  // 新しい課題を作成
  async createTrouble(trouble: CreateTroubleRequest): Promise<CreateTroubleResponse> {
    return apiCall<CreateTroubleResponse>('/troubles', {
      method: 'POST',
      body: JSON.stringify(trouble),
    });
  },
}; 

// コメント関連のAPI関数
export const commentAPI = {
  // コメント一覧を取得
  async getComments(troubleId: string): Promise<CommentItem[]> {
    const params = new URLSearchParams();
    params.append('trouble_id', troubleId);
    
    const endpoint = `/comments?${params.toString()}`;
    return apiCall<CommentItem[]>(endpoint, {}, COMMENTS_API_URL!);
  },

  // 新しいコメントを作成
  async createComment(commentData: CreateCommentRequest): Promise<CommentItem> {
    return apiCall<CommentItem>('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    }, COMMENTS_API_URL!);
  },
}; 