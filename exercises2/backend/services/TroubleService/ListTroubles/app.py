import os
import json
import boto3
from boto3.dynamodb.conditions import Key
dynamoDB = boto3.resource("dynamodb")
table = dynamoDB.Table(name=os.getenv("TABLE_NAME"))

def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            'Access-Control-Allow-Origin': '*',
        },
    }

def handle_exception(e):
    return generate_response(500, {"message": "サーバー内部エラー", "error": str(e)})

def lambda_handler(event, context):
    query_params = event.get("queryStringParameters") or {}
    next_token = query_params.get("nextToken")

    query_kwargs = {}

    if next_token:
        try:
            query_kwargs["ExclusiveStartKey"] = json.loads(next_token)
        except Exception as e:
            return generate_response(400, {"message": "Invalid nextToken", "error": str(e)})

    try:
        response = table.scan(**query_kwargs)
        items = response.get("Items", [])
        last_evaluated_key = response.get("LastEvaluatedKey")

        formatted_items = [
            {
                "item_id": item.get("item_id").removeprefix("trouble#"),
                "category": item.get("category", ""),
                "message": item.get("message", ""),
            }
            for item in items
        ]

        return generate_response(200, {
            "items": formatted_items,
            "nextToken": json.dumps(last_evaluated_key) if last_evaluated_key else None
        })

    except Exception as e:
        return handle_exception(e)
