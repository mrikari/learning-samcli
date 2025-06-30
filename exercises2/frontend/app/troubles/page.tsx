'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { troubleAPI, TroubleItem as APITroubleItem, APIError, commentAPI, CommentItem } from '../../libs/api';

// 表示用の課題アイテムの型定義（APIの型を拡張）
interface TroubleItem extends APITroubleItem {
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: Date;
  assignedTo?: string;
}

// コメント表示用の型定義
interface DisplayComment {
  id: string;
  user_id: string;
  comment: string;
  createdAt: Date;
}

// APIのデータを表示用の形式に変換
function convertAPITroubleToDisplayTrouble(apiTrouble: APITroubleItem): TroubleItem {
  return {
    ...apiTrouble,
    severity: 'Medium', // デフォルト値（APIには含まれていない）
    status: 'Open', // デフォルト値（APIには含まれていない）
    createdAt: new Date(), // デフォルト値（APIには含まれていない）
  };
}

// コメントAPIデータを表示用に変換
function convertAPICommentToDisplayComment(apiComment: CommentItem): DisplayComment {
  const skParts = apiComment.SK.split('#');
  const dateStr = skParts[1];
  const commentId = skParts[2];
  
  return {
    id: commentId,
    user_id: apiComment.user_id,
    comment: apiComment.comment,
    createdAt: new Date(dateStr),
  };
}

export default function TroublesPage() {
  const { user, loading } = useAuth();
  const [troubles, setTroubles] = useState<TroubleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrouble, setNewTrouble] = useState<{
    category: string;
    message: string;
    severity: TroubleItem['severity'];
  }>({
    category: '',
    message: '',
    severity: 'Medium',
  });

  // コメント関連の状態
  const [comments, setComments] = useState<Record<string, DisplayComment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentLoading, setCommentLoading] = useState<Set<string>>(new Set());
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Set<string>>(new Set());

  // 課題一覧を取得
  const loadTroubles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📥 課題一覧を取得中...');
      const response = await troubleAPI.listTroubles();
      console.log('📥 取得した課題:', response);
      
      const displayTroubles = response.items.map(convertAPITroubleToDisplayTrouble);
      setTroubles(displayTroubles);
    } catch (err) {
      console.error('❌ 課題取得エラー:', err);
      if (err instanceof APIError) {
        setError(`課題の取得に失敗しました: ${err.message}`);
      } else {
        setError('課題の取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // コメント一覧を取得
  const loadComments = async (troubleId: string) => {
    setCommentLoading(prev => new Set(prev).add(troubleId));
    
    try {
      console.log(`📥 課題 ${troubleId} のコメントを取得中...`);
      const response = await commentAPI.getComments(troubleId);
      console.log('📥 取得したコメント:', response);
      
      const displayComments = response.map(convertAPICommentToDisplayComment);
      displayComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // 新しい順
      
      setComments(prev => ({ ...prev, [troubleId]: displayComments }));
    } catch (err) {
      console.error('❌ コメント取得エラー:', err);
      if (err instanceof APIError) {
        setError(`コメントの取得に失敗しました: ${err.message}`);
      } else {
        setError('コメントの取得に失敗しました');
      }
    } finally {
      setCommentLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(troubleId);
        return newSet;
      });
    }
  };

  // コメントを投稿
  const submitComment = async (troubleId: string) => {
    const commentText = newCommentText[troubleId]?.trim();
    if (!commentText) {
      alert('コメントを入力してください');
      return;
    }

    setSubmittingComment(prev => new Set(prev).add(troubleId));

    try {
      console.log(`📤 課題 ${troubleId} にコメントを投稿中...`);
      const response = await commentAPI.createComment({
        trouble_id: troubleId,
        comment: commentText,
      });
      console.log('✅ コメント投稿成功:', response);

      // ローカル状態を更新
      const newComment = convertAPICommentToDisplayComment(response);
      setComments(prev => ({
        ...prev,
        [troubleId]: [newComment, ...(prev[troubleId] || [])],
      }));

      // フォームをリセット
      setNewCommentText(prev => ({ ...prev, [troubleId]: '' }));

      alert('コメントが投稿されました');
    } catch (err) {
      console.error('❌ コメント投稿エラー:', err);
      if (err instanceof APIError) {
        setError(`コメントの投稿に失敗しました: ${err.message}`);
        alert(`コメントの投稿に失敗しました: ${err.message}`);
      } else {
        setError('コメントの投稿に失敗しました');
        alert('コメントの投稿に失敗しました');
      }
    } finally {
      setSubmittingComment(prev => {
        const newSet = new Set(prev);
        newSet.delete(troubleId);
        return newSet;
      });
    }
  };

  // コメントセクションの展開/折りたたみ
  const toggleComments = async (troubleId: string) => {
    if (expandedComments.has(troubleId)) {
      // 折りたたみ
      setExpandedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(troubleId);
        return newSet;
      });
    } else {
      // 展開（コメントがまだ取得されていない場合は取得）
      setExpandedComments(prev => new Set(prev).add(troubleId));
      if (!comments[troubleId]) {
        await loadComments(troubleId);
      }
    }
  };

  // 初期データ読み込み
  useEffect(() => {
    if (!loading && user) {
      loadTroubles();
    } else if (!loading && !user) {
      // 認証されていない場合は課題リストをクリア
      setTroubles([]);
    }
  }, [user, loading]);

  const handleCreateTrouble = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTrouble.category.trim() || !newTrouble.message.trim()) {
      alert('カテゴリーと説明を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📤 新しい課題を作成中...', newTrouble);
      
      // APIで課題を作成
      const response = await troubleAPI.createTrouble({
        category: newTrouble.category,
        message: newTrouble.message,
      });
      
      console.log('✅ 課題作成成功:', response);

      // ローカル状態を更新（新しく作成したアイテムを先頭に追加）
      const newDisplayTrouble: TroubleItem = {
        item_id: response.item_id,
        category: response.category,
        message: newTrouble.message,
        severity: newTrouble.severity,
        status: 'Open',
        createdAt: new Date(),
        assignedTo: user?.username,
      };
      
      setTroubles(prev => [newDisplayTrouble, ...prev]);
      
      // フォームをリセット
      setNewTrouble({ category: '', message: '', severity: 'Medium' });
      setShowCreateForm(false);
      
      alert('課題が正常に登録されました');
    } catch (err) {
      console.error('❌ 課題作成エラー:', err);
      if (err instanceof APIError) {
        setError(`課題の作成に失敗しました: ${err.message}`);
        alert(`課題の作成に失敗しました: ${err.message}`);
      } else {
        setError('課題の作成に失敗しました');
        alert('課題の作成に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#dc3545';
      case 'High': return '#fd7e14';
      case 'Medium': return '#ffc107';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#dc3545';
      case 'In Progress': return '#007bff';
      case 'Resolved': return '#28a745';
      case 'Closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  // 認証チェック中または未認証の場合は何も表示しない
  if (loading || !user) {
    return (
      <div style={styles.loadingContainer}>
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>日々の面倒事</h1>
        <p style={styles.welcome}>
          ようこそ、{user?.email || user?.username}さん
        </p>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
          <button 
            onClick={() => setError('')}
            style={styles.errorCloseButton}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.actions}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={styles.createButton}
          disabled={isLoading}
        >
          {showCreateForm ? 'キャンセル' : '新しい課題を登録'}
        </button>
        
        <button
          onClick={loadTroubles}
          style={styles.refreshButton}
          disabled={isLoading}
        >
          {isLoading ? '読み込み中...' : '更新'}
        </button>
      </div>

      {showCreateForm && (
        <div style={styles.createForm}>
          <h3 style={styles.formTitle}>新しい課題の登録</h3>
          <form onSubmit={handleCreateTrouble} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>カテゴリー</label>
                              <input
                  type="text"
                  value={newTrouble.category}
                  onChange={(e) => setNewTrouble(prev => ({ ...prev, category: e.target.value }))}
                  style={styles.input}
                  placeholder="課題のカテゴリーを入力（例：ログイン、API、UI）"
                  required
                  disabled={isLoading}
                />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>説明</label>
                              <textarea
                  value={newTrouble.message}
                  onChange={(e) => setNewTrouble(prev => ({ ...prev, message: e.target.value }))}
                  style={styles.textarea}
                  placeholder="課題の詳細を入力"
                  rows={4}
                  required
                  disabled={isLoading}
                />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>重要度</label>
              <select
                value={newTrouble.severity}
                onChange={(e) => setNewTrouble(prev => ({ ...prev, severity: e.target.value as TroubleItem['severity'] }))}
                style={styles.select}
                disabled={isLoading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

                          <button 
                type="submit" 
                style={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? '登録中...' : '課題を登録'}
              </button>
          </form>
        </div>
      )}

      <div style={styles.troublesList}>
        <h2 style={styles.listTitle}>
          課題一覧 ({troubles.length}件)
          {isLoading && <span style={styles.loadingIndicator}> - 読み込み中...</span>}
        </h2>
        
        {troubles.length === 0 && !isLoading ? (
          <div style={styles.emptyState}>
            <p>現在課題はありません</p>
          </div>
        ) : (
          troubles.map((trouble) => (
            <div key={trouble.item_id} style={styles.troubleCard}>
              <div style={styles.troubleHeader}>
                <h3 style={styles.troubleTitle}>{trouble.category}</h3>
                <div style={styles.troubleBadges}>
                  <span 
                    style={{
                      ...styles.badge,
                      backgroundColor: getSeverityColor(trouble.severity),
                    }}
                  >
                    {trouble.severity}
                  </span>
                  <span 
                    style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(trouble.status),
                    }}
                  >
                    {trouble.status}
                  </span>
                </div>
              </div>
              
              <p style={styles.troubleDescription}>{trouble.message}</p>
              
              <div style={styles.troubleInfo}>
                <span style={styles.troubleDate}>
                  作成日: {trouble.createdAt.toLocaleDateString('ja-JP')}
                </span>
                {trouble.assignedTo && (
                  <span style={styles.troubleAssignee}>
                    担当者: {trouble.assignedTo}
                  </span>
                )}
                <span style={styles.troubleId}>
                  ID: {trouble.item_id}
                </span>
              </div>

              {/* コメント機能 */}
              <div style={styles.commentSection}>
                <button
                  onClick={() => toggleComments(trouble.item_id)}
                  style={styles.commentToggleButton}
                  disabled={commentLoading.has(trouble.item_id)}
                >
                  {commentLoading.has(trouble.item_id) ? (
                    'コメント読み込み中...'
                  ) : (
                    `コメント (${comments[trouble.item_id]?.length || 0}件) ${
                      expandedComments.has(trouble.item_id) ? '▼' : '▶'
                    }`
                  )}
                </button>

                {expandedComments.has(trouble.item_id) && (
                  <div style={styles.commentArea}>
                    {/* コメント投稿フォーム */}
                    <div style={styles.commentForm}>
                      <textarea
                        value={newCommentText[trouble.item_id] || ''}
                        onChange={(e) => setNewCommentText(prev => ({ 
                          ...prev, 
                          [trouble.item_id]: e.target.value 
                        }))}
                        style={styles.commentTextarea}
                        placeholder="コメントを入力..."
                        rows={3}
                        disabled={submittingComment.has(trouble.item_id)}
                      />
                      <button
                        onClick={() => submitComment(trouble.item_id)}
                        style={styles.commentSubmitButton}
                        disabled={submittingComment.has(trouble.item_id) || !newCommentText[trouble.item_id]?.trim()}
                      >
                        {submittingComment.has(trouble.item_id) ? '投稿中...' : 'コメント投稿'}
                      </button>
                    </div>

                    {/* コメント一覧 */}
                    <div style={styles.commentsList}>
                      {comments[trouble.item_id]?.length === 0 ? (
                        <p style={styles.noComments}>まだコメントはありません</p>
                      ) : (
                        comments[trouble.item_id]?.map((comment) => (
                          <div key={comment.id} style={styles.commentItem}>
                            <div style={styles.commentHeader}>
                              <span style={styles.commentUser}>{comment.user_id}</span>
                              <span style={styles.commentDate}>
                                {comment.createdAt.toLocaleString('ja-JP')}
                              </span>
                            </div>
                            <p style={styles.commentText}>{comment.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// インラインスタイル
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#666',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  welcome: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#721c24',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  createForm: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    border: '1px solid #e9ecef',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical' as const,
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  submitButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  troublesList: {
    marginTop: '20px',
  },
  listTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  loadingIndicator: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'normal',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  troubleCard: {
    backgroundColor: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  troubleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  troubleTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0',
    color: '#333',
    flex: 1,
  },
  troubleBadges: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
  },
  troubleDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '15px',
  },
  troubleInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#999',
    flexWrap: 'wrap' as const,
  },
  troubleDate: {},
  troubleAssignee: {},
  troubleId: {},
  commentSection: {
    marginTop: '20px',
  },
  commentToggleButton: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#666',
  },
  commentArea: {
    marginTop: '10px',
  },
  commentForm: {
    display: 'flex',
    gap: '10px',
  },
  commentTextarea: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  commentSubmitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
  },
  commentsList: {
    marginTop: '10px',
  },
  commentItem: {
    marginBottom: '10px',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: '12px',
    color: '#666',
  },
  commentText: {
    margin: '0',
  },
  noComments: {
    textAlign: 'center' as const,
    color: '#666',
  },
}; 