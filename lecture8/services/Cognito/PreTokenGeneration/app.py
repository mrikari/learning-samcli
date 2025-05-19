import os

def lambda_handler(event, context):
    user_attrs = event["request"]["userAttributes"]
    role_id = user_attrs.get("custom:role")
    username = event["userName"]  # Cognitoのユーザー名（例: "user01"）

    if not role_id:
        raise Exception("Missing custom:role")

    claims = {
        "username": username,
        "role": role_id,
    }

    event["response"] = {"claimsOverrideDetails": {"claimsToAddOrOverride": claims}}

    return event
