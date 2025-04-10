"""
TODOアイテム作成用のLambda関数

このモジュールはTODOアイテムを作成するためのLambda関数を提供します。
リクエストボディからTODOの情報を取得し、DynamoDBに保存します。
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

# DynamoDBのエンドポイントURL（ローカル開発用）
ENDPOINT_URL = os.getenv('ENDPOINT_URL') or None

# DynamoDBリソースとテーブルの初期化
dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb", endpoint_url=ENDPOINT_URL)
table = dynamoDB.Table(name=os.getenv("TODO_TABLE_NAME"))

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
        "headers": {
            'Access-Control-Allow-Origin': '*',  # CORS対応
        },
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
    
    # リクエストボディからフィールドを抽出
    title = body.get('title')
    description = body.get('description', '')
    due_date = body.get('due_date')
    is_completed = body.get('is_completed', False)
    priority = body.get('priority', 'medium')
    tags = body.get('tags', [])

    # TODOアイテム用のユニークIDを生成
    todo_id = str(uuid.uuid4())
    
    try:
        # TODOアイテムをDynamoDBに保存
        todo_item = {
            "id": todo_id,
            "title": title,
            "description": description,
            "due_date": due_date,
            "is_completed": is_completed,
            "priority": priority,
            "tags": tags,
        }
        
        table.put_item(Item=todo_item)
        logger.info("アイテムが作成されました。ID: %s", todo_id)
    except Exception as e:
        return handle_exception(e)

    # 成功レスポンスを返す
    response_body = {
        "message": "アイテムが作成されました",
        "id": todo_id,
        "title": title,
        "description": description,
        "due_date": due_date,
        "is_completed": is_completed,
        "priority": priority,
        "tags": tags,
    }
    
    return generate_response(201, response_body)
