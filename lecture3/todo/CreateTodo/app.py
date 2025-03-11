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
    body = json.loads(event.get('body', '{}'))
    
    try:
        validate(event=body, schema=schema)
    except SchemaValidationError as e:
        logger.error("Schema validation error: %s", e)
        return generate_response(400, {"message": "Invalid input", "error": str(e)})
    
    title = body.get('title', 'default_title')
    
    try:
        table.put_item(
            Item={
                "id": str(uuid.uuid4()),
                "title": title,
                "checked": False,
            }
        )
        logger.info("Item created with title: %s", title)
    except Exception as e:
        return handle_exception(e)

    return generate_response(201, {"message": "Item created", "title": title})
