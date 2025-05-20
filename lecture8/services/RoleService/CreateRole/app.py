import os
import uuid
import boto3
import json
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ROLE_TABLE_NAME"])

def lambda_handler(event, context):
    try:
        # リクエストボディの取得とJSONパース
        body = json.loads(event.get('body', '{}'))

        # body から name, is_super_user, allow_operations を取得
        name = body.get("name", "")
        is_super_user = body.get("is_super_user", False)
        allowed_operations = body.get("allowed_operations", [])

        # tableにPUTするデータを作成
        item = {
            "role_id": str(uuid.uuid4()),  # UUIDを生成
            "name": name,
            "is_super_user": is_super_user,
            "allowed_operations": allowed_operations
        }
        # DynamoDBにデータを追加
        response = table.put_item(Item=item)

        # レスポンスからrole_idを取得
        role_id = response.get("Attributes", {}).get("role_id", item["role_id"])

        
        # role_idを含むレスポンスを作成
        roles = {
            "role_id": role_id,
            "name": name,
            "is_super_user": is_super_user,
            "allowed_operations": allowed_operations
        }

        # 成功レスポンスを返す
        return {
            "statusCode": 201,
            "body": json.dumps(roles),
            "headers": {
                "Content-Type": "application/json"
            }
        }

    except Exception as e:
        # 作成に失敗した場合はエラーレスポンスを返す
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to create role"})
        }
