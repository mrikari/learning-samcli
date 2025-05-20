import os
import boto3
import json

client = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]

def lambda_handler(event, context):
    print("[GetUser] Event:", event)
    print("[GetUser] Context:", context)
    path_params = event.get("pathParameters") or {}
    username = path_params.get("username")

    if username == "me":
        username = event["requestContext"]["authorizer"]["username"]

    try:
        response = client.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=username
        )

        attributes = {attr["Name"]: attr["Value"] for attr in response.get("UserAttributes", [])}

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "username": response["Username"],
                "status": response.get("UserStatus"),
                "enabled": response.get("Enabled"),
                "email": attributes.get("email"),
                "role": attributes.get("custom:role"),
                "sub": attributes.get("sub")
            })
        }

    except client.exceptions.UserNotFoundException:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "User not found"})
        }
    except Exception as e:
        print("[GetUser] Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal server error"})
        }
