from aws_lambda_powertools.utilities.validation import validate, SchemaValidationError
import json

# パスパラメータのスキーマ
path_schema = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string"}
    },
    "required": ["user_id"]
}

def lambda_handler(event, context):
    try:
        # API Gateway のパスパラメータは `event["pathParameters"]` に格納
        path_params = event.get("pathParameters", {})

        # バリデーション実行
        validate(path_params, path_schema)

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Valid path parameter", "user_id": path_params["user_id"]})
        }
    except SchemaValidationError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid path parameter", "details": str(e)})
        }
