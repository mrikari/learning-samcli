import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ROLE_TABLE_NAME"])

def lambda_handler(event, context):
    user_attrs = event["request"]["userAttributes"]
    role_id = user_attrs.get("custom:role")

    if not role_id:
        raise Exception("Missing custom:role")

    try:
        response = table.get_item(Key={"role_id": role_id})
        role = response.get("Item", {})
    except Exception as e:
        raise Exception(f"Failed to fetch role info: {str(e)}")

    is_super_user = role.get("is_super_user", False)
    allowed_operations = role.get("allowed_operations", [])

    claims = {
        "role": role_id,
        "is_super_user": is_super_user
    }

    if not is_super_user and allowed_operations:
        # allowed_operations: List[str] → CSV形式で格納
        claims["allowed_operations"] = ",".join(allowed_operations)

    event["response"] = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": claims
        }
    }

    return event
