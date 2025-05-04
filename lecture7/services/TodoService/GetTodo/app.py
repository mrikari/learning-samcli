import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
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

    raw_id = event['pathParameters'].get('id')
    todo_id = f"todo#{raw_id}"
    user_id = event["requestContext"]["authorizer"]["principalId"]

    try:
        response = table.get_item(
            Key={
                "user_id": user_id,
                "todo_id": todo_id
            }
        )
        item = response.get('Item')

        if item:
            # レスポンスでは prefix を外して返す
            item["todo_id"] = item["todo_id"].removeprefix("todo#")
            del item["user_id"]
            item["is_completed"] = bool(item.get("is_completed", False))
            return generate_response(200, item)
        else:
            logger.warning("アイテムが見つかりません: %s", todo_id)
            return generate_response(404, {"message": "指定されたTODOが見つかりません"})

    except Exception as e:
        return handle_exception(e)
