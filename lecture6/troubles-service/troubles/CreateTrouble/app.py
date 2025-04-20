"""
新しい困りごとを投稿用のLambda関数
この関数は、DynamoDBに新しいアイテムを追加します。
この関数は、リクエストボディとしてJSON形式のデータを受け取り、
アイテムのID、メッセージ、カテゴリを含む必要があります。
リクエストボディのスキーマは、schema.pyで定義されています。
この関数は、AWS Lambda Powertoolsのロギング機能を使用して、
ログを記録します。
"""

import json
import os
import uuid
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools.utilities.validation import validate
from aws_lambda_powertools.utilities.validation.exceptions import SchemaValidationError
from schema import schema
from aws_lambda_powertools import Logger

# ロガーの初期化
logger = Logger()

# DynamoDBリソースとテーブルの初期化
dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb")
table = dynamoDB.Table(name=os.getenv("TABLE_NAME"))

def generate_response(status_code, body):
    """
    APIレスポンスを生成する関数
    
    Args:
        status_code (int): HTTPステータスコード
        body (dict): レスポンスボディ
        
    Returns:
        dict: API Gateway形式のレスポンス
    """
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
    }

def handle_exception(e):
    """
    例外処理を行う関数
    
    Args:
        e (Exception): 発生した例外
        
    Returns:
        dict: エラーレスポンス
    """
    logger.error("エラーが発生しました: %s", e)
    return generate_response(500, {"message": "サーバー内部エラー", "error": str(e)})

@logger.inject_lambda_context
def lambda_handler(event, context):
    """
    Lambda関数のエントリーポイント
    
    Args:
        event (dict): Lambda関数に渡されるイベントデータ
        context (LambdaContext): Lambda関数のランタイム情報
        
    Returns:
        dict: API Gateway形式のレスポンス
    """
    logger.info("イベントを受信しました: %s", event)
    
    # リクエストボディの取得とJSONパース
    body = json.loads(event.get('body', '{}'))
    
    try:
        # リクエストボディをスキーマに対して検証
        validate(event=body, schema=schema)
    except SchemaValidationError as e:
        logger.error("スキーマ検証エラー: %s", e)
        return generate_response(400, {"message": "入力が無効です", "error": str(e)})
    
    # アイテム用のユニークIDを生成
    id = str(uuid.uuid4())
    # リクエストボディからフィールドを抽出
    message = body.get('message')
    category = body.get('category', '')

    
    try:
        # アイテムをDynamoDBに保存
        item = {
            "id": id,
            "message": message,
            "category": category,
        }
        
        table.put_item(Item=item)
        logger.info("アイテムが作成されました。ID: %s", id)
    except Exception as e:
        return handle_exception(e)

    # 成功レスポンスを返す
    response_body = {
        "result": "アイテムが作成されました",
        "item": {
            "id": id,
            "message": message,
            "category": category,
        },
    }
    return generate_response(201, response_body)
