import os
import json
import jwt
import boto3
import requests
from jwt import InvalidTokenError
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
import base64

dynamodb = boto3.resource("dynamodb")
role_table = dynamodb.Table(os.environ["ROLE_TABLE_NAME"])
cognito_user_pool_id = os.environ["COGNITO_USER_POOL_ID"]
cognito_client_id = os.environ["COGNITO_CLIENT_ID"]

def int_to_bytes(n):
    return n.to_bytes((n.bit_length() + 7) // 8, byteorder='big')

def get_public_key(token):
    keys = get_public_keys()
    headers = jwt.get_unverified_header(token)
    kid = headers["kid"]
    
    for key in keys:
        if key["kid"] == kid:
            numbers = RSAPublicNumbers(
                e=int.from_bytes(base64.urlsafe_b64decode(key["e"] + "=="), byteorder='big'),
                n=int.from_bytes(base64.urlsafe_b64decode(key["n"] + "=="), byteorder='big')
            )
            public_key = numbers.public_key(backend=default_backend())
            return public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
    
    raise InvalidTokenError("No matching key found")

# Cognitoの公開鍵を取得
def get_public_keys():
    region = os.environ["AWS_REGION"]
    keys_url = f"https://cognito-idp.{region}.amazonaws.com/{cognito_user_pool_id}/.well-known/jwks.json"
    response = requests.get(keys_url)
    return response.json()["keys"]

def lambda_handler(event, context):
    print("[Authorizer] Event:", json.dumps(event))

    token = event.get("authorizationToken", "").replace("Bearer ", "").strip()
    method_arn = event["methodArn"]

    try:
        # 公開鍵を取得
        public_key = get_public_key(token)
        
        # トークンを検証
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=cognito_client_id,  # クライアントID
            issuer=f"https://cognito-idp.{os.environ['AWS_REGION']}.amazonaws.com/{cognito_user_pool_id}"
        )
        
        username = claims.get("username")
        role_id = claims.get("custom:role")
        principal_id = claims.get("sub")
        
        if not all([username, role_id, principal_id]):
            print("Missing required claims")
            return generate_deny("unauthorized", method_arn)
            
    except InvalidTokenError as e:
        print(f"Invalid token: {str(e)}")
        return generate_deny("unauthorized", method_arn)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return generate_deny("unauthorized", method_arn)

    role_data = fetch_role_data(role_id)
    print(f"[Authorizer] Role data: {role_data}")
    if not role_data:
        return generate_deny(principal_id, method_arn)

    is_super_user = role_data.get("is_super_user") in [True, "true", "True", 1, "1"]

    if is_super_user:
        print(f"[Authorizer] Super user: {principal_id}")
        return generate_allow(
            principal_id,
            [get_method_arn_prefix(method_arn) + "/*/*"],
            context={
                "username": username,
            },
        )

    allowed_ops = role_data.get("allowed_operations", [])
    allowed_arns = expand_allowed_operations(allowed_ops, method_arn)

    return generate_allow(
        principal_id,
        allowed_arns,
        context={
            "username": username,
        },
    )


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


def generate_allow(principal_id, resources, context=None):
    return generate_policy(principal_id, "Allow", resources, context)


def generate_deny(principal_id, method_arn):
    return generate_policy(principal_id, "Deny", [method_arn])


def generate_policy(principal_id, effect, resources, context=None):
    print(f"[Authorizer] Generating {effect} for resources: {resources}")
    policy = {
        "principalId": principal_id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": resources,
                }
            ],
        },
    }

    if context:
        policy["context"] = context

    return policy
