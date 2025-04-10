"""
TODOアイテム取得用のLambda関数

このモジュールは指定されたIDのTODOアイテムを取得するためのLambda関数を提供します。
パスパラメータからIDを取得し、DynamoDBからアイテムを検索します。
"""

import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
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
    
    # パスパラメータからTODO IDを取得
    item_id = event['pathParameters']['id']

    try:
        # DynamoDBからアイテムを取得
        response = table.get_item(
            Key={
                "id": item_id
            }
        )
        item = response.get('Item', None)

        if item:
            # 取得したアイテムからレスポンスボディを構築
            body = {
                "id": item["id"],
                "title": item["title"],
                "description": item.get("description", ""),
                "due_date": item.get("due_date"),
                "is_completed": item.get("is_completed", False),
                "priority": item.get("priority", "medium"),
                "tags": item.get("tags", [])
            }
            status_code = 200
            logger.info("アイテムが取得されました: %s", body)
        else:
            # アイテムが見つからない場合
            body = {
                "message": "指定されたTODOが見つかりません"
            }
            status_code = 404
            logger.warning("アイテムが見つかりません: %s", item_id)
    except Exception as e:
        return handle_exception(e)

    return generate_response(status_code, body)
