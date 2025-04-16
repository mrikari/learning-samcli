/**
 * Todoアイテムの型定義
 * 
 * このインターフェースはTodoアイテムのデータ構造を定義します。
 * バックエンドAPIとの通信やフロントエンドでの表示に使用されます。
 */
export interface Todo {
  /** Todoの一意識別子 */
  id: string;
  
  /** Todoのタイトル（必須） */
  title: string;
  
  /** Todoの詳細説明（任意） */
  description?: string;
  
  /** Todoの期限日（YYYY-MM-DD形式、任意） */
  due_date?: string;
  
  /** Todoの完了状態 */
  is_completed: boolean;
  
  /** Todoの優先度（低、中、高） */
  priority: "low" | "medium" | "high";
  
  /** Todoに関連するタグの配列 */
  tags: string[];
}
