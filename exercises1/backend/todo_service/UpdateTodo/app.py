"""
TODOアイテム更新用のLambda関数

このモジュールは指定されたIDのTODOアイテムを更新するためのLambda関数を提供します。
パスパラメータからIDを取得し、リクエストボディから更新内容を取得して、DynamoDBのアイテムを更新します。
"""

import json
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from aws_lambda_powertools.utilities.validation import validate
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
    
    # パスパラメータからTODO IDを取得
    item_id = event['pathParameters']['id']
    
    # リクエストボディの取得とJSONパース
    body = json.loads(event.get('body', '{}'))

    try:
        # リクエストボディをスキーマに対して検証
        validate(event=body, schema=schema)
    except ValueError as e:
        logger.error("スキーマ検証エラー: %s", e)
        return generate_response(400, {"message": "入力が無効です", "errors": str(e)})

    # 更新するフィールドを抽出
    title = body.get('title')
    description = body.get('description')
    due_date = body.get('due_date')
    is_completed = body.get('is_completed')
    priority = body.get('priority')
    tags = body.get('tags')

    # 更新式の構築
    update_expression = "SET "
    expression_attribute_values = {}
    
    # タイトルの更新処理
    if title is not None:
        update_expression += "title = :title, "
        expression_attribute_values[':title'] = title
    
    # 説明の更新処理
    if description is not None:
        update_expression += "description = :description, "
        expression_attribute_values[':description'] = description
    
    # 期限日の更新処理
    if due_date is not None:
        update_expression += "due_date = :due_date, "
        expression_attribute_values[':due_date'] = due_date
    
    # 完了状態の更新処理
    if is_completed is not None:
        # null値の場合はFalseに設定
        if is_completed is None:
            update_expression += "is_completed = :is_completed, "
            expression_attribute_values[':is_completed'] = False
        # ブール値の場合はそのまま設定
        elif isinstance(is_completed, bool):
            update_expression += "is_completed = :is_completed, "
            expression_attribute_values[':is_completed'] = is_completed
        # 無効な型の場合はエラー
        else:
            logger.error("is_completedの型が無効です: %s", type(is_completed))
            return generate_response(400, {"message": "入力が無効です", "errors": "is_completedはブール値である必要があります"})
    else:
        # is_completedが指定されていない場合はデフォルトでFalseに設定
        update_expression += "is_completed = :is_completed, "
        expression_attribute_values[':is_completed'] = False
    
    # 優先度の更新処理
    if priority is not None:
        update_expression += "priority = :priority, "
        expression_attribute_values[':priority'] = priority
    
    # タグの更新処理
    if tags is not None:
        update_expression += "tags = :tags, "
        expression_attribute_values[':tags'] = tags

    # 末尾のカンマとスペースを削除
    update_expression = update_expression.rstrip(', ')

    try:
        # DynamoDBのアイテムを更新
        response = table.update_item(
            Key={
                "id": item_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ConditionExpression="attribute_exists(id)",  # アイテムが存在することを確認
            ReturnValues="ALL_NEW"  # 更新後の全ての属性を返す
        )
        logger.info("アイテムが更新されました。ID: %s", item_id)
    except dynamoDB.meta.client.exceptions.ConditionalCheckFailedException:
        # アイテムが見つからない場合
        logger.warning("アイテムが見つかりません: %s", item_id)
        return generate_response(404, {"message": "指定されたTODOが見つかりません"})
    except Exception as e:
        return handle_exception(e)

    # レスポンスボディの構築
    updated_item = response.get('Attributes', None)
    response_body = {
        "id": updated_item["id"],
        "title": updated_item["title"],
        "description": updated_item.get("description", ""),
        "due_date": updated_item.get("due_date"),
        "is_completed": updated_item.get("is_completed", False),
        "priority": updated_item.get("priority", "medium"),
        "tags": updated_item.get("tags", [])
    }

    logger.info("更新されたアイテム: %s", response_body)
    return generate_response(200, response_body)
