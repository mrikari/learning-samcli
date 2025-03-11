import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools import Logger

logger = Logger()

ENDPOINT_URL = os.getenv('ENDPOINT_URL') or None
dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb", endpoint_url=ENDPOINT_URL)
table = dynamoDB.Table(name=os.getenv("STATUS_TABLE"))

def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
    }

def handle_exception(e):
    logger.error("Error: %s", e)
    return generate_response(500, {"message": "Internal server error", "error": str(e)})

@logger.inject_lambda_context
def lambda_handler(event, context):
    logger.info("Received event: %s", event)
    query_params = event.get('queryStringParameters') or {}
    next_token = query_params.get('nexttoken')

    scan_kwargs = {'Limit': 10}
    if next_token:
        scan_kwargs['ExclusiveStartKey'] = {"id": next_token}

    try:
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        last_evaluated_key = response.get('LastEvaluatedKey', None)

        result = [{"id": item.get("id"), "title": item.get("title"), "checked": item.get("checked", False)} for item in items]

        body = {
            "items": result,
            "nextToken": json.dumps(last_evaluated_key) if last_evaluated_key else None,
        }

        logger.info("Items retrieved: %s", result)
        return generate_response(200, body)
    except Exception as e:
        return handle_exception(e)
