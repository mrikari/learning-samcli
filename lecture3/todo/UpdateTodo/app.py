import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools.utilities.validation import validate
from schema import schema
from aws_lambda_powertools import Logger

logger = Logger()

ENDPOINT_URL = os.getenv('ENDPOINT_URL') or None

endpoint_url = os.getenv("ENDPOINT_URL")
dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb", endpoint_url=endpoint_url)
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
    body = json.loads(event.get('body', '{}'))

    try:
        validate(event=body, schema=schema)
    except ValueError as e:
        logger.error("Schema validation error: %s", e)
        return generate_response(400, {"message": "Invalid input", "errors": str(e)})

    title = body.get('title')
    checked = body.get('checked')

    update_expression = "SET "
    expression_attribute_values = {}
    if title is not None:
        update_expression += "title = :title, "
        expression_attribute_values[':title'] = title
    if checked is not None:
        update_expression += "checked = :checked, "
        expression_attribute_values[':checked'] = checked

    update_expression = update_expression.rstrip(', ')

    try:
        response = table.update_item(
            Key={
                "id": item_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )
        logger.info("Item updated with id: %s", item_id)
    except Exception as e:
        return handle_exception(e)

    updated_item = response.get('Attributes', None)

    if updated_item:
        body = {
            "id": updated_item["id"],
            "title": updated_item["title"],
            "checked": updated_item["checked"],
        }
        status_code = 200
        logger.info("Updated item: %s", body)
    else:
        body = {
            "message": "Item not found"
        }
        status_code = 404
        logger.warning("Item not found: %s", item_id)

    return generate_response(status_code, body)
