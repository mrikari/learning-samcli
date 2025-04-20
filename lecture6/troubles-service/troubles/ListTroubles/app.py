"""
投稿された困りごと一覧を取得するLambda関数
この関数はDynamoDBからデータを取得し、API Gatewayを通じてレスポンスを返します。
この関数はAWS Lambda Powertoolsを使用してロギングとエラーハンドリングを行います。
この関数は、DynamoDBのスキャン操作を使用して、すべてのアイテムを取得します。
この関数は、クエリパラメータとしてnextTokenを受け取り、ページネーションをサポートします。
"""

import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
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
    
    # クエリパラメータの取得
    query_params = event.get('queryStringParameters') or {}
    next_token = query_params.get('nextToken')

    # スキャンパラメータの設定
    scan_kwargs = {}
    if next_token:
        scan_kwargs['ExclusiveStartKey'] = json.loads(next_token)

    try:
        # DynamoDBテーブルをスキャン
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        last_evaluated_key = response.get('LastEvaluatedKey', None)

        # Todoスキーマに基づいてアイテムをフォーマット
        formatted_items = [
            {
                "id": item.get("id"),
                "message": item.get("message"),
                "category": item.get("category", ""),
            }
            for item in items
        ]

        # ページネーション対応のレスポンスボディを構築
        # 現在はシンプルな配列を返しているが、将来的にはページネーション情報も含めることができる
        response_body = {
            "items": formatted_items,
            "nextToken": json.dumps(last_evaluated_key) if last_evaluated_key else None,
        }

        logger.info("アイテムが取得されました: %d件", len(formatted_items))
        return generate_response(200, response_body)
    except Exception as e:
        return handle_exception(e)
