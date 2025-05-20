from datetime import datetime, timedelta
import json
import os
import time
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TroubleTable')
LOG_GROUP_NAME = os.environ['LOG_GROUP_NAME']
cloudwatchlogs = boto3.client('logs')

def lambda_handler(event, context):

    # ログストリーム名は、CheckTroubleCount-YYYY-MM-DD-HH の形式である
    # １時間前のものがあるかを確認する
    now = datetime.now()
    one_hour_ago = now - timedelta(hours=1)
    one_hour_ago_str = one_hour_ago.strftime('%Y-%m-%d-%H')
    
    # ログストリームが存在しない場合は処理を終了
    log_streams = cloudwatchlogs.describe_log_streams(
        logGroupName=LOG_GROUP_NAME,
        logStreamNamePrefix=f"CheckTroubleCount-{one_hour_ago_str}",
    )

    if len(log_streams['logStreams']) == 0:
        print("count: 0")
        return {
            "statusCode": 200,
            "body": json.dumps({
                "count": 0,
            }),
        }

    # あれば、そのログストリームのログイベントを取得し、行数をカウントする
    count = 0
    for log_stream in log_streams['logStreams']:
        log_events = cloudwatchlogs.get_log_events(
            logGroupName=LOG_GROUP_NAME,
            logStreamName=log_stream['logStreamName'],
        )
        count += len(log_events['events'])

    print(f"count: {count}")
    return {
        "statusCode": 200,
        "body": json.dumps({
            "count": count,
        }),
    }
