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

        try:
            # 指定されたIDのアイテムを削除
            table.delete_item(
                Key={"role_id": role_id},
                ConditionExpression="attribute_exists(role_id)",  # 削除前にアイテムが存在することを確認
            )
        except dynamodb.meta.client.exceptions.ConditionalCheckFailedException as e:
            print("Error:", str(e))
            # アイテムが見つからない場合
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "No such role"})
            }
        except Exception as e:
            print("Error:", str(e))
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Failed to update role"})
            }

        # 成功レスポンスを返す
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Role updated successfully", "role_id": role_id}),
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
