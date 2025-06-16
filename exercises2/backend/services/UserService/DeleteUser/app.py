import os
import boto3
import json

client = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]

def lambda_handler(event, context):
    path_params = event.get("pathParameters") or {}
    username = path_params.get("username")

    # 自己削除は不可
    if username == "me":
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Use /users/me or operation is not allowed"})
        }

    try:
        client.admin_delete_user(
            UserPoolId=USER_POOL_ID,
            Username=username
        )
        return {
            "statusCode": 204,
            "body": ""  # No content
        }

    except client.exceptions.UserNotFoundException:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "User not found"})
        }
    except Exception as e:
        print("[DeleteUser] Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal server error"})
        }
