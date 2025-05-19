import json
import boto3

dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb")
table = dynamoDB.Table(name=os.getenv("TABLE_NAME"))

def generate_response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            'Access-Control-Allow-Origin': '*',
        },
    }

def handle_exception(e):
    return generate_response(500, {"message": "サーバー内部エラー", "error": str(e)})

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        validate(event=body, schema=schema)
    except SchemaValidationError as e:
        return generate_response(400, {"message": "入力が無効です", "error": str(e)})
    except Exception as e:
        return handle_exception(e)

    # 認証されたユーザーのID（Cognitoのsub）
    user_id = event["requestContext"]["authorizer"]["principalId"]
    item_id = f"trouble#{uuid.uuid4()}"

    # 項目取得
    todo_item = {
        "user_id": user_id,
        "item_id": item_id,
        "title": body.get("title"),
        "description": body.get("description", ""),
    }

    try:
        table.put_item(Item=todo_item)
    except Exception as e:
        return handle_exception(e)

    return generate_response(201, {
        "message": "アイテムが作成されました",
        "item_id": todo_id.removeprefix("trouble#"),
        "title": todo_item.get("title"),
        "description": todo_item.get("description", ""),
    })
