schema = {
  "type": "object",
  "title": "CreateTrouble",
  "properties": {
    "message": {
      "type": "string",
      "title": "Message",
      "description": "面倒ごとの件名（必須）",
      "minLength": 1,
      "maxLength": 100
    },
    "category": {
      "type": "string",
      "title": "Category",
      "description": "面倒ごとのカテゴリ",
    },
  },
  "required": ["message"]
}
