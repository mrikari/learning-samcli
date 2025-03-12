import json

def lambda_handler(event, context):
    if "POST" == event["httpMethod"]:
        body = json.loads(event["body"])
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Nice POST message: {body["message"]}.',
            })
        }
    elif "GET" == event["httpMethod"]:
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Nice message: {event["queryStringParameters"]["message"]}.',
            })
        }
