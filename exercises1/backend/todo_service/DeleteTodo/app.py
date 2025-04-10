"""
TODOアイテム削除用のLambda関数

このモジュールは指定されたIDのTODOアイテムを削除するためのLambda関数を提供します。
パスパラメータからIDを取得し、DynamoDBからアイテムを削除します。
"""

import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools import Logger

# ロガーの初期化
logger = Logger()

# DynamoDBのエンドポイントURL（ローカル開発用）
ENDPOINT_URL = os.getenv("ENDPOINT_URL") or None

# DynamoDBリソースとテーブルの初期化
dynamoDB: DynamoDBServiceResource = boto3.resource(
    "dynamodb", endpoint_url=ENDPOINT_URL
)
table = dynamoDB.Table(name=os.getenv("TODO_TABLE_NAME"))


def generate_response(status_code, body=None):
    """
    APIレスポンスを生成する関数
    
    Args:
        status_code (int): HTTPステータスコード
        body (dict, optional): レスポンスボディ（省略可能）
        
    Returns:
        dict: API Gateway形式のレスポンス
    """
    response = {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",  # CORS対応
        },
    }
    if body is not None:
        response["body"] = json.dumps(body)
    return response


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
    item_id = event["pathParameters"]["id"]

    try:
        # 指定されたIDのアイテムを削除
        table.delete_item(
            Key={"id": item_id},
            ConditionExpression="attribute_exists(id)",  # 削除前にアイテムが存在することを確認
        )
    except dynamoDB.meta.client.exceptions.ConditionalCheckFailedException:
        # アイテムが見つからない場合
        logger.error("アイテムが見つかりません: %s", item_id)
        return generate_response(404, {"message": "指定されたTODOが見つかりません", "id": item_id})
    except Exception as e:
        return handle_exception(e)

    logger.info("アイテムが削除されました。ID: %s", item_id)
    return generate_response(204)  # 削除成功時は204 No Contentを返す
