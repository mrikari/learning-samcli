import boto3
import os
import json

client = boto3.client("cognito-idp")

USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]

def lambda_handler(event, context):
    try:
        users = []
        pagination_token = None

        while True:
            params = {
                "UserPoolId": USER_POOL_ID,
                "Limit": 50
            }
            if pagination_token:
                params["PaginationToken"] = pagination_token

            response = client.list_users(**params)
            users.extend(response["Users"])

            if "PaginationToken" in response:
                pagination_token = response["PaginationToken"]
            else:
                break

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps([map_user(u) for u in users])
        }

    except Exception as e:
        print("[ListUsers] Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "internal_server_error"})
        }

def map_user(user):
    attr = {a["Name"]: a["Value"] for a in user.get("Attributes", [])}
    return {
        "username": user["Username"],
        "status": user.get("UserStatus"),
        "enabled": user.get("Enabled"),
        "email": attr.get("email"),
        "role": attr.get("custom:role"),
        "sub": attr.get("sub")
    }
