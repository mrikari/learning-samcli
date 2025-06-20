import os
import uuid
import boto3
import json
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ROLE_TABLE_NAME"])

def lambda_handler(event, context):
    try:
        # パスパラメータからTODO IDを取得
        role_id = event['pathParameters']['role_id']

        response = table.get_item(
            Key={
                "role_id": role_id
            }
        )
        # アイテムが存在しない場合は404エラーを返す
        if "Item" not in response or len(response["Item"]) == 0:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Role not found"})
            }
        item = response.get("Item")
        result = {
            "role_id": item["role_id"],
            "name": item.get("name", ""),
            "is_super_user": item.get("is_super_user", False),
            "allowed_operations": item.get("allowed_operations", []),
        }
        return {
            "statusCode": 200,
            "headers": { "Content-Type": "application/json" },
            "body": json.dumps(result),
        }

    except Exception as e:
        # 作成に失敗した場合はエラーレスポンスを返す
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to get role"})
        }
