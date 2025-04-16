import { atom } from "jotai";

import { Todo } from "../types/Todo";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASEURL || "http://localhost:3000";

export const todosAtom = atom<Todo[]>([]);

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch(`${BASE_URL}/todos`);
  if (!response.ok) {
    throw new Error("Failed to fetch TODOs");
  }
  return response.json();
};
