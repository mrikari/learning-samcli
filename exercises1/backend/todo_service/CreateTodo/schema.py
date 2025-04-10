schema = {
  "type": "object",
  "title": "CreateTodo",
  "properties": {
    "title": {
      "type": "string",
      "title": "Title",
      "description": "TODOのタイトル（必須）",
      "minLength": 1,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "description": "TODOの説明（任意）",
      "maxLength": 500
    },
    "due_date": {
      "type": "string",
      "format": "date",
      "description": "TODOの期限（YYYY-MM-DD、任意）"
    },
    "is_completed": {
      "type": "boolean",
      "description": "TODOの完了状態（任意）",
      "default": False
    },
    "priority": {
      "type": "string",
      "description": "優先度（任意）",
      "enum": ["low", "medium", "high"],
      "default": "medium"
    },
    "tags": {
      "type": "array",
      "description": "タグ一覧（任意、最大10個）",
      "maxItems": 10,
      "items": {
        "type": "string",
        "maxLength": 20
      }
    }
  },
  "required": ["title"]
}
