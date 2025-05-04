import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools import Logger
from botocore.exceptions import ClientError

logger = Logger()

ENDPOINT_URL = os.getenv("ENDPOINT_URL") or None
dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb", endpoint_url=ENDPOINT_URL)
table = dynamoDB.Table(name=os.getenv("TODO_TABLE_NAME"))
client = boto3.client("dynamodb", endpoint_url=ENDPOINT_URL)

def generate_response(status_code, body=None):
    response = {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
        },
    }
    if body is not None:
        response["body"] = json.dumps(body)
    return response

def handle_exception(e):
    logger.error("エラーが発生しました: %s", e)
    return generate_response(500, {"message": "サーバー内部エラー", "error": str(e)})

@logger.inject_lambda_context
def lambda_handler(event, context):
    logger.info("イベントを受信しました: %s", event)

    raw_id = event["pathParameters"]["id"]
    todo_id = f"todo#{raw_id}"
    user_id = event["requestContext"]["authorizer"]["principalId"]

    try:
        table.delete_item(
            Key={"user_id": user_id, "todo_id": todo_id},
            ConditionExpression="attribute_exists(user_id) AND attribute_exists(todo_id)",
        )
    except client.exceptions.ConditionalCheckFailedException:
        logger.warning("削除対象が見つかりません: %s", todo_id)
        return generate_response(404, {"message": "指定されたTODOが見つかりません", "id": raw_id})
    except Exception as e:
        return handle_exception(e)

    logger.info("TODO削除完了: %s", todo_id)
    return generate_response(204)
