import os
import boto3
import json

client = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["COGNITO_USER_POOL_ID"]

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        username = body["username"]
        email = body["email"]
        role = body["role"]  # UUID形式でcustom:roleに格納
        temp_password = body.get("temporary_password", "TempPassword123!")

        # ユーザー名のバリデーション
        if not username or len(username) < 3 or len(username) > 32:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid username"})
            }
        elif username == "me":
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Username 'me' is reserved"})
            }

        # ユーザー作成
        response = client.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=username,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "custom:role", "Value": role}
            ],
            TemporaryPassword=temp_password,
            MessageAction="SUPPRESS"  # 通知メールを抑止する場合
        )

        # パスワードを強制リセットなしに設定（オプション）
        client.admin_set_user_password(
            UserPoolId=USER_POOL_ID,
            Username=username,
            Password=temp_password,
            Permanent=True
        )

        return {
            "statusCode": 201,
            "body": json.dumps({
                "message": "User created",
                "username": username
            })
        }

    except client.exceptions.UsernameExistsException:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Username already exists"})
        }
    except KeyError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Missing field: {str(e)}"})
        }
    except Exception as e:
        print("[CreateUser] Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal server error"})
        }
