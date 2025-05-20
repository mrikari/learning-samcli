import json
import os
import time
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TroubleTable')
LOG_GROUP_NAME = os.environ['LOG_GROUP_NAME']
cloudwatchlogs = boto3.client('logs')

def lambda_handler(event, context):

    # ログストリームが存在しない場合は作成する
    log_stream_name = f'CheckTroubleCount-{time.strftime("%Y-%m-%d-%H")}'
    log_streams = cloudwatchlogs.describe_log_streams(
        logGroupName=LOG_GROUP_NAME,
        logStreamNamePrefix=log_stream_name,
    )
    if len(log_streams['logStreams']) == 0:
        cloudwatchlogs.create_log_stream(
            logGroupName=LOG_GROUP_NAME,
            logStreamName=log_stream_name
        )

    # DynamoDBStreamがInsertされたら、rowの内容を取得して、categoryが "緊急" であるかどうかを判定する
    # 緊急であれば CloudWatchLogsにログを出力する
    # 緊急でなければ何もしない
    print(event)
    for record in event['Records']:
        if record['eventName'] == 'INSERT':
            row = record['dynamodb']['NewImage']
            category = row['category']['S']
            message = row['message']['S']
            if category == '緊急':
                # ログストリームは1時間ごとに切り替わるよう命名する
                cloudwatchlogs.put_log_events(
                    logGroupName=LOG_GROUP_NAME,
                    logStreamName=log_stream_name,
                    logEvents=[
                        {
                            'timestamp': int(time.time() * 1000),
                            # unicodeにならないようにする
                            'message': json.dumps(message, ensure_ascii=False)
                        }
                    ]
                )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "OK",
        }),
    }
