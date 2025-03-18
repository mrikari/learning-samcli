from aws_lambda_powertools.utilities.validation import validate, SchemaValidationError
import json

# JSON ボディのスキーマ
put_schema = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string"},
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "age": {"type": "integer", "minimum": 18}
    },
    "required": ["user_id", "name", "email"]
}

def lambda_handler(event, context):
    try:
        # API Gateway のリクエストボディを取得し JSON に変換
        body = json.loads(event.get("body", "{}"))

        # バリデーション実行
        validate(body, put_schema)

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Valid payload", "data": body})
        }
    except SchemaValidationError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid payload", "details": str(e)})
        }
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid JSON format"})
        }
