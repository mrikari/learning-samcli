import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools.utilities.validation import validate
from schema import schema
from aws_lambda_powertools import Logger
from botocore.exceptions import ClientError

logger = Logger()

ENDPOINT_URL = os.getenv('ENDPOINT_URL') or None
dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb", endpoint_url=ENDPOINT_URL)
table = dynamoDB.Table(name=os.getenv("TODO_TABLE_NAME"))
client = boto3.client("dynamodb", endpoint_url=ENDPOINT_URL)

def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {'Access-Control-Allow-Origin': '*'},
    }

def handle_exception(e):
    logger.error("エラーが発生しました: %s", e)
    return generate_response(500, {"message": "サーバー内部エラー", "error": str(e)})

@logger.inject_lambda_context
def lambda_handler(event, context):
    logger.info("イベントを受信しました: %s", event)

    raw_id = event['pathParameters']['id']
    todo_id = f"todo#{raw_id}"
    user_id = event["requestContext"]["authorizer"]["principalId"]

    try:
        body = json.loads(event.get('body', '{}'))
        validate(event=body, schema=schema)
    except Exception as e:
        return generate_response(400, {"message": "入力が無効です", "error": str(e)})

    # 更新式の構築
    update_expression = "SET "
    expression_attribute_values = {}

    def add_update_expr(field, value):
        nonlocal update_expression
        update_expression += f"{field} = :{field}, "
        expression_attribute_values[f":{field}"] = value

    for field in ["title", "description", "due_date", "priority", "tags"]:
        if field in body:
            add_update_expr(field, body[field])

    # is_completedの特殊処理
    is_completed = body.get("is_completed")
    if isinstance(is_completed, bool):
        add_update_expr("is_completed", is_completed)
    else:
        add_update_expr("is_completed", False)

    update_expression = update_expression.rstrip(", ")

    try:
        response = table.update_item(
            Key={"user_id": user_id, "todo_id": todo_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ConditionExpression="attribute_exists(user_id) AND attribute_exists(todo_id)",
            ReturnValues="ALL_NEW"
        )
        updated = response.get("Attributes", {})

        # クライアント返却時にprefixを除外
        updated["todo_id"] = updated["todo_id"].removeprefix("todo#")

        return generate_response(200, updated)

    except client.exceptions.ConditionalCheckFailedException:
        logger.warning("対象のTODOが存在しません: %s", todo_id)
        return generate_response(404, {"message": "指定されたTODOが見つかりません"})
    except Exception as e:
        return handle_exception(e)
