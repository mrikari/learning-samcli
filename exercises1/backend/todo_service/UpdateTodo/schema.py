schema = {
  "type": "object",
  "title": "UpdateTodo",
  "properties": {
    "title": {
      "anyOf": [
        {"type": "string"},
        {"type": "null"}
      ],
      "description": "TODOのタイトル（任意）",
      "minLength": 1,
      "maxLength": 100
    },
    "description": {
      "anyOf": [
        {"type": "string"},
        {"type": "null"}
      ],
      "description": "TODOの説明（任意）",
      "maxLength": 500
    },
    "due_date": {
      "anyOf": [
        {"type": "string", "format": "date"},
        {"type": "null"}
      ],
      "description": "TODOの期限（YYYY-MM-DD、任意）"
    },
    "is_completed": {
      "anyOf": [
        {"type": "boolean"},
        {"type": "null"}
      ],
      "description": "TODOの完了状態（任意）"
    },
    "priority": {
      "anyOf": [
        {"type": "string"},
        {"type": "null"}
      ],
      "description": "優先度（任意）",
      "enum": ["low", "medium", "high"]
    },
    "tags": {
      "anyOf": [
        {"type": "array", "items": {"type": "string", "maxLength": 20}, "maxItems": 10},
        {"type": "null"}
      ],
      "description": "タグ一覧（任意、最大10個）"
    }
  },
  "additionalProperties": False
}
