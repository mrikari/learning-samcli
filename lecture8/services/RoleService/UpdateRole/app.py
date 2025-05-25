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

        # リクエストボディの取得とJSONパース
        body = json.loads(event.get('body', '{}'))

        print("[UpdateRole] Event:", json.dumps(event))
        print("[UpdateRole] Body:", json.dumps(body))

        # 更新するフィールドを抽出
        name = body.get("name")
        is_super_user = body.get("is_super_user")
        allowed_operations = body.get("allowed_operations")

        # 更新式の構築
        update_expression = "SET "
        expression_attribute_values = {}
        expression_attribute_names = {}
        
        # nameの更新処理
        if name is not None:
            update_expression += "#name = :name, "
            expression_attribute_values[":name"] = name
            expression_attribute_names["#name"] = "name"
        # is_super_userの更新処理
        if is_super_user is not None:
            update_expression += "is_super_user = :is_super_user, "
            expression_attribute_values[':is_super_user'] = is_super_user
        # allowed_operationsの更新処理
        if allowed_operations is not None:
            update_expression += "allowed_operations = :allowed_operations, "
            expression_attribute_values[':allowed_operations'] = allowed_operations

        # 末尾のカンマとスペースを削除
        update_expression = update_expression.rstrip(', ')

        try:
            # DynamoDBのアイテムを更新
            response = table.update_item(
                Key={
                    "role_id": role_id
                },
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ExpressionAttributeNames=expression_attribute_names or None,  # 空dictなら None
                ConditionExpression="attribute_exists(role_id)",  # アイテムが存在することを確認
                ReturnValues="ALL_NEW"  # 更新後の全ての属性を返す
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
