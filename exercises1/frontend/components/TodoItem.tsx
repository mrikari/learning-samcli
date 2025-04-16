"use client";
/**
 * TodoItemコンポーネント
 * 
 * 個々のTodoアイテムを表示するためのコンポーネントです。
 * チェックボックス、タイトル、説明、期限日、優先度、タグなどを表示し、
 * 編集や削除などのアクションを提供します。
 */
import React, { useState } from "react";
import { Todo } from "../types/Todo";
import { deleteTodo } from "../services/apiClient";

/**
 * TodoItemコンポーネントのプロパティ
 */
interface TodoItemProps {
  /** 表示するTodoアイテム */
  todo: Todo;
  /** 完了状態が変更された時のコールバック関数 */
  onStatusChange?: (id: string, isCompleted: boolean) => void;
  /** 編集ボタンがクリックされた時のコールバック関数 */
  onEdit?: (todo: Todo) => void;
  /** 削除が完了した時のコールバック関数 */
  onDelete?: (id: string) => void;
}

/**
 * 優先度に応じた色の定義
 */
const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

/**
 * 優先度のラベル定義
 */
const PRIORITY_LABELS = {
  low: "低",
  medium: "中",
  high: "高"
};

/**
 * 期限が近いと判断する日数（3日）
 */
const SOON_THRESHOLD_DAYS = 3;

/**
 * TodoItemコンポーネント
 */
const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onStatusChange, 
  onEdit, 
  onDelete 
}) => {
  // 説明の展開状態を管理するstate
  const [isExpanded, setIsExpanded] = useState(false);
  // 削除処理中かどうかを管理するstate
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * 期限が近いかどうかを判定
   * 3日以内の場合はtrueを返す
   */
  const isDueSoon = todo.due_date
    ? new Date(todo.due_date).getTime() - Date.now() < SOON_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
    : false;

  /**
   * Todoを削除する処理
   */
  const handleDelete = async () => {
    if (isDeleting) return; // 多重クリック防止
    
    setIsDeleting(true);
    try {
      await deleteTodo(todo.id);
      if (onDelete) {
        onDelete(todo.id);
      }
    } catch (error) {
      console.error("Todoの削除に失敗しました:", error);
      setIsDeleting(false); // エラー時のみリセット（成功時はコンポーネントがアンマウントされる）
    }
  };

  /**
   * 完了状態を変更する処理
   */
  const handleStatusChange = () => {
    if (onStatusChange) {
      onStatusChange(todo.id, !(todo.is_completed || false));
    }
  };

  /**
   * 説明の展開状態を切り替える処理
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex items-start p-3 border-b border-gray-200 hover:bg-gray-50">
      {/* チェックボックス */}
      <div className="mr-3 pt-1">
        <input
          type="checkbox"
          checked={todo.is_completed || false}
          onChange={handleStatusChange}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`${todo.title}を${todo.is_completed ? '未完了' : '完了'}としてマーク`}
        />
      </div>

      {/* コンテンツ */}
      <div className="flex-grow">
        <div className="flex items-center">
          <h3 
            className={`text-base font-medium ${todo.is_completed || false ? "line-through text-gray-500" : ""}`}
            onClick={toggleExpanded}
          >
            {todo.title}
          </h3>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[todo.priority]}`}>
            {PRIORITY_LABELS[todo.priority]}
          </span>
        </div>

        {/* 期限日 */}
        {todo.due_date && (
          <p className={`text-xs ${isDueSoon ? "text-red-600" : "text-gray-500"}`}>
            期限: {new Date(todo.due_date).toLocaleDateString()}
          </p>
        )}

        {/* 説明（展開可能） */}
        {isExpanded && todo.description && (
          <p className="mt-1 text-sm text-gray-600">{todo.description}</p>
        )}

        {/* タグ */}
        {todo.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {todo.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* アクション */}
      <div className="flex space-x-2 ml-2">
        <button 
          className="p-1 text-blue-600 cursor-pointer hover:text-blue-800"
          onClick={() => onEdit && onEdit(todo)}
          aria-label="編集"
        >
          ✏️
        </button>
        <button 
          className="p-1 text-red-600 hover:text-red-800"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="削除"
        >
          {isDeleting ? (
            <span className="inline-block cursor-pointer animate-spin">⏳</span>
          ) : (
            <span className="inline-block cursor-pointer">🗑️</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
