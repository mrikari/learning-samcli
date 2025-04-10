"use client";
import React, { useState, useEffect } from "react";
import { getTodos, deleteTodo, updateTodo } from "../services/apiClient";
import AddTodoForm from "./AddTodoForm";
import EditTodoForm from "./EditTodoForm";
import Modal from "./Modal";
import { Todo } from "../types/Todo";
import TodoItem from "./TodoItem";

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      const data = await getTodos();
      setTodos(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch Todos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleDelete = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const handleStatusChange = async (id: string, isCompleted: boolean) => {
    try {
      // Find the todo to update
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;
      
      // Update on the server
      const { id: _, ...todoData } = todoToUpdate;
      const updatedTodo = await updateTodo(id, {
        description: todoData.description,
        due_date: todoData.due_date,
        priority: todoData.priority,
        tags: todoData.tags,
        is_completed: isCompleted
      });
      
      // Update local state
      setTodos((prevTodos) =>
        prevTodos.map((todo) => {
          if (todo.id === id) {
            return { ...todo, is_completed: isCompleted };
          }
          return todo;
        })
      );
    } catch (error) {
      console.error("Failed to update todo status:", error);
      // Revert the checkbox state in case of error
      setTodos((prevTodos) => [...prevTodos]);
    }
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleTodoUpdated = (updatedTodo: Todo) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      )
    );
    setIsEditModalOpen(false);
  };

  const filteredTodos = selectedTag
    ? todos.filter((todo) => todo.tags.includes(selectedTag))
    : todos;

  const allTags = Array.from(new Set(todos.flatMap((todo) => todo.tags)));

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 500"
            className="w-8 h-8 text-blue-600"
          >
            <g>
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="363.459"
          x2="397.066"
          y1="82.696"
          y2="82.696"
              />
              <path
          d="M397.066,82.696c11.988,0,21.689,9.811,21.689,21.939"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="418.756"
          x2="418.756"
          y1="104.636"
          y2="453.047"
              />
              <path
          d="M418.756,453.047c0,12.114-9.701,21.953-21.689,21.953"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="397.066"
          x2="102.932"
          y1="475"
          y2="475"
              />
              <path
          d="M102.932,475c-11.975,0-21.688-9.839-21.688-21.953"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="81.244"
          x2="81.244"
          y1="453.047"
          y2="104.636"
              />
              <path
          d="M81.244,104.636c0-12.128,9.713-21.939,21.688-21.939"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="102.932"
          x2="131.906"
          y1="82.696"
          y2="82.696"
              />
              <polyline
          fill="none"
          points="342.859,50.625 286.991,50.625 286.991,45.851"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <path
          d="M286.991,45.851c0-11.542-9.24-20.851-20.571-20.851"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="266.42"
          x2="233.621"
          y1="25"
          y2="25"
              />
              <path
          d="M233.621,25c-11.359,0-20.627,9.309-20.627,20.851"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <polyline
          fill="none"
          points="212.994,45.851 212.994,50.625 157.181,50.625"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <path
          d="M157.181,50.625c-11.374,0-20.599,9.35-20.599,20.878"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <polyline
          fill="none"
          points="136.582,71.503 136.582,115.857 363.459,115.857 363.459,71.503"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <path
          d="M363.459,71.503c0-11.528-9.184-20.878-20.6-20.878"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
              />
              <g>
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="2.6131"
            strokeWidth="10"
            x1="137.6"
            x2="156.218"
            y1="221.173"
            y2="238.492"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="2.6131"
            strokeWidth="10"
            x1="190.412"
            x2="156.218"
            y1="200.699"
            y2="238.492"
          />
              </g>
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="222.875"
          x2="362.44"
          y1="223.462"
          y2="223.462"
              />
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="222.875"
          x2="362.44"
          y1="392.56"
          y2="392.56"
              />
              <line
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="2.6131"
          strokeWidth="10"
          x1="222.875"
          x2="362.44"
          y1="309.239"
          y2="309.239"
              />
            </g>
          </svg>
          <span className="text-blue-600">Your</span> Todo List
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-500 transition-colors"
        >
          Add Todo
        </button>
      </div>

      {/* Filter tags */}
      {allTags.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Filter by tag:</div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                selectedTag === null
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedTag === tag
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Todo list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}
        
        {error && (
          <div className="p-4 text-center text-red-500">{error}</div>
        )}
        
        {!loading && !error && filteredTodos.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No todos found. Add a new todo to get started!
          </div>
        )}
        
        {!loading && !error && filteredTodos.map((todo) => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Add Todo Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <AddTodoForm
          onTodoAdded={(newTodo) => {
            setTodos((prevTodos) => [...prevTodos, newTodo]);
            setIsAddModalOpen(false);
          }}
        />
      </Modal>

      {/* Edit Todo Modal */}
      {selectedTodo && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <EditTodoForm
            todo={selectedTodo}
            onTodoUpdated={handleTodoUpdated}
            onClose={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default TodoList;
