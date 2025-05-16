import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from aws_lambda_powertools import Logger

logger = Logger()

dynamodb = boto3.resource("dynamodb", endpoint_url=os.getenv("ENDPOINT_URL"))
table = dynamodb.Table(os.environ["TODO_TABLE_NAME"])

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

    query_params = event.get("queryStringParameters") or {}
    next_token = query_params.get("nextToken")

    user_id = event["requestContext"]["authorizer"]["principalId"]

    query_kwargs = {
        "KeyConditionExpression": Key("user_id").eq(user_id)
    }

    if next_token:
        try:
            query_kwargs["ExclusiveStartKey"] = json.loads(next_token)
        except Exception as e:
            return generate_response(400, {"message": "Invalid nextToken", "error": str(e)})

    try:
        response = table.query(**query_kwargs)
        items = response.get("Items", [])
        last_evaluated_key = response.get("LastEvaluatedKey")

        formatted_items = [
            {
                "todo_id": item.get("todo_id").removeprefix("todo#"),
                "title": item.get("title"),
                "description": item.get("description", ""),
                "due_date": item.get("due_date"),
                "is_completed": item.get("is_completed", False),
                "priority": item.get("priority", "medium"),
                "tags": item.get("tags", [])
            }
            for item in items
        ]

        return generate_response(200, {
            "items": formatted_items,
            "nextToken": json.dumps(last_evaluated_key) if last_evaluated_key else None
        })

    except Exception as e:
        return handle_exception(e)
