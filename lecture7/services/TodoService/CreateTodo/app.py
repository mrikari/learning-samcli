import json
import os
import uuid
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools.utilities.validation import validate
from aws_lambda_powertools.utilities.validation.exceptions import SchemaValidationError
from schema import schema
from aws_lambda_powertools import Logger

logger = Logger()
ENDPOINT_URL = os.getenv('ENDPOINT_URL') or None
dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb", endpoint_url=ENDPOINT_URL)
table = dynamoDB.Table(name=os.getenv("TODO_TABLE_NAME"))

def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            'Access-Control-Allow-Origin': '*',
        },
    }

def handle_exception(e):
    logger.error("エラーが発生しました: %s", e)
    return generate_response(500, {"message": "サーバー内部エラー", "error": str(e)})

@logger.inject_lambda_context
def lambda_handler(event, context):
    logger.info("イベントを受信しました: %s", event)

    try:
        body = json.loads(event.get('body', '{}'))
        validate(event=body, schema=schema)
    except SchemaValidationError as e:
        return generate_response(400, {"message": "入力が無効です", "error": str(e)})
    except Exception as e:
        return handle_exception(e)

    # 認証されたユーザーのID（Cognitoのsub）
    user_id = event["requestContext"]["authorizer"]["principalId"]
    todo_id = f"todo#{uuid.uuid4()}"

    # 項目取得
    todo_item = {
        "user_id": user_id,
        "todo_id": todo_id,
        "title": body.get("title"),
        "description": body.get("description", ""),
        "due_date": body.get("due_date"),
        "is_completed": body.get("is_completed", False),
        "priority": body.get("priority", "medium"),
        "tags": body.get("tags", []),
    }

    try:
        table.put_item(Item=todo_item)
        logger.info("TODO作成完了: %s", todo_id)
    except Exception as e:
        return handle_exception(e)

    return generate_response(201, {
        "message": "アイテムが作成されました",
        "todo_id": todo_id.removeprefix("todo#"),
        "title": todo_item.get("title"),
        "description": todo_item.get("description", ""),
        "due_date": todo_item.get("due_date"),
        "is_completed": todo_item.get("is_completed", False),
        "priority": todo_item.get("priority", "medium"),
        "tags": todo_item.get("tags", []),
    })
