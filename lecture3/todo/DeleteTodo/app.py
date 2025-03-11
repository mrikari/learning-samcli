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
    item_id = event['pathParameters']['id']

    try:
        response = table.delete_item(
            Key={
                "id": item_id
            },
            ConditionExpression="attribute_exists(id)"
        )
    except dynamoDB.meta.client.exceptions.ConditionalCheckFailedException:
        logger.error("Item not found: %s", item_id)
        return generate_response(404, {"message": "Item not found", "id": item_id})
    except Exception as e:
        return handle_exception(e)

    logger.info("Item deleted with id: %s", item_id)
    return generate_response(200, {"message": "Item deleted", "id": item_id})
