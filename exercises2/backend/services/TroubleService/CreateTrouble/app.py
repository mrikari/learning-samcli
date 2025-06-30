import json
import boto3
import os
import uuid

dynamoDB = boto3.resource("dynamodb")
table = dynamoDB.Table(name=os.getenv("TABLE_NAME"))
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")

def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            'Access-Control-Allow-Origin': allowed_origins,
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        },
    }

def handle_exception(e):
    return generate_response(500, {"message": "サーバー内部エラー", "error": str(e)})

def lambda_handler(event, context):
    if "OPTIONS" == event["httpMethod"]:
        return generate_response(200, {"message": "CORS preflight response"})
        
    body = json.loads(event.get('body', '{}'))

    # 認証されたユーザーのID（Cognitoのsub）
    user_id = event["requestContext"]["authorizer"]["principalId"]
    item_id = f"trouble#{uuid.uuid4()}"

    # 項目取得
    todo_item = {
        "user_id": user_id,
        "item_id": item_id,
        "category": body.get("category", ""),
        "message": body.get("message", ""),
    }

    try:
        table.put_item(Item=todo_item)
    except Exception as e:
        return handle_exception(e)

    return generate_response(201, {
        "message": "アイテムが作成されました",
        "item_id": item_id.removeprefix("trouble#"),
        "category": todo_item.get("category"),
        "message": todo_item.get("message", ""),
    })
