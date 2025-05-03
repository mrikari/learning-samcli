import os
import json
import jwt
import boto3
from jwt import InvalidTokenError

dynamodb = boto3.resource("dynamodb")
role_table = dynamodb.Table(os.environ["ROLE_TABLE_NAME"])
cognito_user_pool_id = os.environ["COGNITO_USER_POOL_ID"]

def lambda_handler(event, context):
    print("[Authorizer] Event:", json.dumps(event))

    token = event.get("authorizationToken", "").replace("Bearer ", "").strip()
    method_arn = event["methodArn"]

    try:
        claims = jwt.decode(token, options={"verify_signature": False})
        role_id = claims.get("custom:role")
        principal_id = claims.get("sub")
    except InvalidTokenError:
        print("Invalid token")
        return generate_deny("unauthorized", method_arn)

    role_data = fetch_role_data(role_id)
    print(f"[Authorizer] Role data: {role_data}")
    if not role_data:
        return generate_deny(principal_id, method_arn)

    is_super_user = role_data.get("is_super_user") in [True, "true", "True", 1, "1"]

    if is_super_user:
        print(f"[Authorizer] Super user: {principal_id}")
        return generate_allow(principal_id, [get_method_arn_prefix(method_arn) + "/*/*"])

    allowed_ops = role_data.get("allowed_operations", [])
    allowed_arns = expand_allowed_operations(allowed_ops, method_arn)

    return generate_allow(principal_id, allowed_arns)


def fetch_role_data(role_id: str):
    try:
        resp = role_table.get_item(Key={"role_id": role_id})
        return resp.get("Item")
    except Exception as e:
        print("DynamoDB error:", str(e))
        return None


def expand_allowed_operations(allowed_ops, method_arn):
    """
    例: methodArn: arn:aws:execute-api:region:account:api-id/stage/METHOD/resource
    """
    parts = method_arn.split("/")
    base_arn = "/".join(parts[:2])  # arn:aws:execute-api:region:account:api-id/stage

    expanded = []
    for op in allowed_ops:
        method, path = op.split(" ", 1)
        if not path.startswith("/"):
            path = "/" + path
        arn = f"{base_arn}/{method}{path}"
        expanded.append(arn)
    return expanded


def get_method_arn_prefix(method_arn: str) -> str:
    return "/".join(method_arn.split("/")[:2])


def generate_allow(principal_id, resources):
    return generate_policy(principal_id, "Allow", resources)


def generate_deny(principal_id, method_arn):
    return generate_policy(principal_id, "Deny", [method_arn])


def generate_policy(principal_id, effect, resources):
    print(f"[Authorizer] Generating {effect} for resources: {resources}")
    return {
        "principalId": principal_id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "execute-api:Invoke",
                "Effect": effect,
                "Resource": resources
            }]
        }
    }
