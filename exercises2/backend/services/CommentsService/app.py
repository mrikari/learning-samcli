import os
import json
import boto3
from boto3.dynamodb.conditions import Key
import uuid
from datetime import datetime

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
    if "GET" == event["httpMethod"]:
        return get_comments(event)
    elif "POST" == event["httpMethod"]:
        return post_comments(event)
    elif "OPTIONS" == event["httpMethod"]:
        return generate_response(200, {"message": "CORS preflight response"})

def get_comments(event):
    query_params = event.get("queryStringParameters") or {}
    trouble_id = query_params.get("trouble_id")

    if not trouble_id:
        return generate_response(400, {"error": "Missing required parameter: trouble_id"})

    pk = f"trouble#{trouble_id}"
    try:
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('PK').eq(pk)
        )
        items = response.get('Items', [])
        return generate_response(200, items)
    except Exception as e:
        return handle_exception(e)

def post_comments(event):
    try:
        body = json.loads(event['body'])
        trouble_id = body.get('trouble_id')
        comment = body.get('comment')

        if not trouble_id or not comment:
            return generate_response(400, {"error": "Missing required parameters: trouble_id and comment"})

        user_sub = event["requestContext"]["authorizer"]["principalId"]
        timestamp = datetime.now().isoformat()
        comment_id = f"{uuid.uuid4()}"

        item = {
            "PK": f"trouble#{trouble_id}",
            "SK": f"createdAt#{timestamp}#{comment_id}",
            "user_id": f"user#{user_sub}",
            "comment": comment
        }

        table.put_item(Item=item)

        return generate_response(201, item)

    except Exception as e:
        return handle_exception(e)
    

