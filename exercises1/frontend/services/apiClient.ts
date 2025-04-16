/**
 * APIクライアント
 * 
 * このモジュールはバックエンドAPIとの通信を担当します。
 * Todo関連の操作（取得、作成、更新、削除）のためのメソッドを提供します。
 */

import axios from 'axios';
import { paths } from '../types/api';
import { Todo } from '../types/Todo';

/**
 * Axiosインスタンスの設定
 * 環境変数からベースURLを取得し、共通ヘッダーを設定
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * レスポンスデータを標準化するヘルパー関数
 * 
 * @param todo APIから返されたTodoデータ
 * @returns 標準化されたTodoオブジェクト
 */
const normalizeTodo = (todo: any): Todo => ({
  ...todo,
  priority: todo.priority || "low",
  is_completed: todo.is_completed !== undefined ? todo.is_completed : false,
  tags: todo.tags || []
});

/**
 * 全てのTodoを取得
 * 
 * @returns Todoの配列
 */
export const getTodos = async (): Promise<Todo[]> => {
  const response = await api.get<Todo[]>('/todos');
  return response.data.map(normalizeTodo);
};

/**
 * 指定されたIDのTodoを取得
 * 
 * @param id 取得するTodoのID
 * @returns 取得したTodoオブジェクト
 */
export const getTodoById = async (id: string): Promise<Todo> => {
  const response = await api.get<paths['/todos/{id}']['get']['responses']['200']['content']['application/json']>(`/todos/${id}`);
  return normalizeTodo(response.data);
};

/**
 * 新しいTodoを作成
 * 
 * @param data 作成するTodoのデータ
 * @returns 作成されたTodoオブジェクト
 */
export const createTodo = async (data: paths['/todos']['post']['requestBody']['content']['application/json']): Promise<Todo> => {
  const response = await api.post<paths['/todos']['post']['responses']['201']['content']['application/json']>('/todos', data);
  return normalizeTodo(response.data);
};

/**
 * 既存のTodoを更新
 * 
 * @param id 更新するTodoのID
 * @param data 更新するデータ
 * @returns 更新されたTodoオブジェクト
 */
export const updateTodo = async (id: string, data: paths['/todos/{id}']['put']['requestBody']['content']['application/json']): Promise<Todo> => {
  const response = await api.put<paths['/todos/{id}']['put']['responses']['200']['content']['application/json']>(`/todos/${id}`, data);
  return normalizeTodo(response.data);
};

/**
 * 指定されたIDのTodoを削除
 * 
 * @param id 削除するTodoのID
 */
export const deleteTodo = async (id: string): Promise<void> => {
  await api.delete(`/todos/${id}`);
};
