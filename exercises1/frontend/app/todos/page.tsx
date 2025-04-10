import React from "react";
import TodoList from "../../components/TodoList";
import { Todo } from "../../types/Todo";

const mockTodos: Todo[] = [
  {
    id: "1",
    title: "Buy groceries",
    description: "Milk, Bread, Eggs, and Fruits",
    due_date: "2025-04-10",
    is_completed: false,
    priority: "medium",
    tags: ["shopping", "errands"],
  },
  {
    id: "2",
    title: "Finish project report",
    description: "Complete the final draft and send it to the manager",
    due_date: "2025-04-09",
    is_completed: false,
    priority: "high",
    tags: ["work", "urgent"],
  },
  {
    id: "3",
    title: "Call the plumber",
    description: "Fix the kitchen sink leakage",
    due_date: "2025-04-12",
    is_completed: true,
    priority: "low",
    tags: ["home", "maintenance"],
  },
  {
    id: "4",
    title: "Plan weekend trip",
    description: "Research destinations and book accommodations",
    due_date: "2025-04-15",
    is_completed: false,
    priority: "low",
    tags: ["leisure", "travel"],
  },
];

const TodosPage: React.FC = () => {
  return (
    <div className="p-6">
      <TodoList />
    </div>
  );
};

export default TodosPage;
