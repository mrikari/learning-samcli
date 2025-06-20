import os
import boto3
import json
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ROLE_TABLE_NAME"])

def lambda_handler(event, context):
    try:
        # フルスキャン（ロール数が少なければ問題なし）
        response = table.scan()
        items = response.get("Items", [])

        roles = []
        for item in items:
            roles.append({
                "role_id": item["role_id"],
                "name": item.get("name", ""),
                "is_super_user": item.get("is_super_user", False),
                "allowed_operations": item.get("allowed_operations", []),
            })

        return {
            "statusCode": 200,
            "body": json.dumps(roles),
            "headers": {
                "Content-Type": "application/json"
            }
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to fetch roles"})
        }
