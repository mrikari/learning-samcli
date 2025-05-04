import os
import boto3
import json

client = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]

def lambda_handler(event, context):
    path_params = event.get("pathParameters") or {}
    username = path_params.get("username")

    if username == "me":
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Use /users/me for self updates"})
        }

    body = json.loads(event.get("body", "{}"))
    user_attributes = []

    if "email" in body:
        user_attributes.append({"Name": "email", "Value": body["email"]})
        user_attributes.append({"Name": "email_verified", "Value": "true"})
    if "custom:role" in body:
        user_attributes.append({"Name": "custom:role", "Value": body["custom:role"]})

    if not user_attributes:
        return {"statusCode": 400, "body": json.dumps({"error": "No attributes to update"})}

    try:
        client.admin_update_user_attributes(
            UserPoolId=USER_POOL_ID,
            Username=username,
            UserAttributes=user_attributes
        )
        return {"statusCode": 200, "body": json.dumps({"message": "User updated"})}
    except client.exceptions.UserNotFoundException:
        return {"statusCode": 404, "body": json.dumps({"error": "User not found"})}
    except Exception as e:
        print("[UpdateUser] Error:", str(e))
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error"})}
