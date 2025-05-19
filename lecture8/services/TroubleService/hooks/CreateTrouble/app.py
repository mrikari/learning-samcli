import json
import boto3

dynamoDB: DynamoDBServiceResource = boto3.resource("dynamodb")
table = dynamoDB.Table(name=os.getenv("TABLE_NAME"))

def lambda_handler(event, context):
    print(event)
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "hello world",
        }),
    }
