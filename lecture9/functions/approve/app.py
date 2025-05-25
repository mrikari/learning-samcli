import json

def lambda_handler(event, context):
    # query paramsからtokenを取得
    token = event['queryStringParameters']['token']
    print(event)

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "OK"})
    }
