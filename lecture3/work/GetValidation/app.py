from aws_lambda_powertools.utilities.validation import validate, SchemaValidationError
import json

# クエリパラメータのスキーマ定義
query_schema = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string"},
        "page": {"type": "integer", "minimum": 1}
    },
    "required": ["user_id"]
}

def lambda_handler(event, context):
    try:
        # API Gateway のクエリパラメータは `event["queryStringParameters"]` に入る
        query_params = event.get("queryStringParameters", {})

        # バリデーション実行
        validate(query_params, query_schema)

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Valid query parameters", "params": query_params})
        }
    except SchemaValidationError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid query parameters", "details": str(e)})
        }
