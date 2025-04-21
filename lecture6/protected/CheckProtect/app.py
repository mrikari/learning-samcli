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
def admin_handler(event, context):
    logger.info("イベントを受信しました: %s", event)
    claims = event['requestContext']['authorizer']['claims']
    groups = claims.get('cognito:groups', '').split(',')  # グループはカンマ区切りの可能性あり
    user_id = claims.get('sub')
    try:
        if "admin" not in groups:
            return generate_response(403, {"message": "Forbidden"})
        response_body = {"message": user_id}
        return generate_response(200, response_body)
    except Exception as e:
        return handle_exception(e)

@logger.inject_lambda_context
def general_handler(event, context):
    logger.info("イベントを受信しました: %s", event)
    claims = event['requestContext']['authorizer']['claims']
    groups = claims.get('cognito:groups', '').split(',')  # グループはカンマ区切りの可能性あり
    user_id = claims.get('sub')
    try:
        response_body = {"message": user_id}
        return generate_response(200, response_body)
    except Exception as e:
        return handle_exception(e)
