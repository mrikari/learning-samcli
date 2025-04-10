"use client";
import React, { useState } from "react";
import { createTodo } from "../services/apiClient";
import { Todo } from "../types/Todo";

interface AddTodoFormProps {
  onTodoAdded: (newTodo: Todo) => void;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  tags?: string;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onTodoAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [tags, setTags] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Title validation (required, 1-100 chars)
    if (!title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    } else if (title.length > 100) {
      errors.title = "Title must be less than 100 characters";
      isValid = false;
    }

    // Description validation (optional, max 500 chars)
    if (description.length > 500) {
      errors.description = "Description must be less than 500 characters";
      isValid = false;
    }

    // Due date validation (required, valid date format)
    if (!dueDate) {
      errors.dueDate = "Due date is required";
      isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errors.dueDate = "Due date must be in YYYY-MM-DD format";
      isValid = false;
    }

    // Tags validation (optional, max 10 tags, each max 20 chars)
    if (tags) {
      const tagList = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
      if (tagList.length > 10) {
        errors.tags = "Maximum 10 tags allowed";
        isValid = false;
      } else {
        const invalidTags = tagList.filter(tag => tag.length > 20);
        if (invalidTags.length > 0) {
          errors.tags = "Each tag must be less than 20 characters";
          isValid = false;
        }
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const newTodo = await createTodo({
        title,
        description,
        due_date: dueDate,
        priority,
        tags: tags.split(",").map((tag) => tag.trim()).filter(tag => tag),
      });
      onTodoAdded({
        ...newTodo,
        priority: newTodo.priority || "low",
        tags: newTodo.tags || [],
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("low");
      setTags("");
      setValidationErrors({});
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to add Todo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-lg font-bold">Add New Todo</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full p-2 border rounded ${validationErrors.title ? 'border-red-500' : ''}`}
          required
          maxLength={100}
        />
        {validationErrors.title && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full p-2 border rounded ${validationErrors.description ? 'border-red-500' : ''}`}
          maxLength={500}
        />
        {validationErrors.description && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">{description.length}/500 characters</p>
      </div>
      <div>
        <label className="block text-sm font-medium">Due Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`w-full p-2 border rounded ${validationErrors.dueDate ? 'border-red-500' : ''}`}
          required
        />
        {validationErrors.dueDate && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.dueDate}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
          className="w-full p-2 border rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Tags</label>
        <div className="mb-2">
          {tags.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag)
            .map((tag, index) => (
              <span 
                key={index} 
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-2"
              >
                {tag}
                <button
                  type="button"
                  className="ml-1 text-blue-500 hover:text-blue-700"
                  onClick={() => {
                    const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
                    tagList.splice(index, 1);
                    setTags(tagList.join(', '));
                  }}
                >
                  ×
                </button>
              </span>
            ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={`w-full p-2 border rounded ${validationErrors.tags ? 'border-red-500' : ''}`}
            placeholder="Enter tags separated by commas"
          />
        </div>
        {validationErrors.tags && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.tags}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">Maximum 10 tags, each up to 20 characters</p>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Todo"}
      </button>
    </form>
  );
};

export default AddTodoForm;
