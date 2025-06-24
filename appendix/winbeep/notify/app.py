import os
import json
import uuid
import boto3
import hashlib

sqs = boto3.client("sqs")
queue_url = os.environ["QUEUE_URL"]

def get_group_id(api_key):
    """Generate a consistent Group ID by hashing the API key."""
    return hashlib.sha256(api_key.encode()).hexdigest()

def handler(event, context):
    method = event['httpMethod']
    headers = event.get("headers") or {}
    api_key = headers.get("x-api-key")

    if not api_key:
        return {"statusCode": 400, "body": "Missing x-api-key header"}

    message_group_id = get_group_id(api_key)

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        message = body.get("message")
        if not message:
            return {"statusCode": 400, "body": "Missing 'message'"}
        
        sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps({"message": message}),
            MessageGroupId=message_group_id,
            MessageDeduplicationId=str(uuid.uuid4())
        )
        return {"statusCode": 200, "body": "Message sent"}

    elif method == "GET":
        response = sqs.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=3,
            AttributeNames=['MessageGroupId']
        )
        messages = response.get("Messages")
        if messages:
            for msg in messages:
                if msg.get('Attributes', {}).get('MessageGroupId') == message_group_id:
                    body = json.loads(msg["Body"])
                    sqs.delete_message(
                        QueueUrl=queue_url,
                        ReceiptHandle=msg["ReceiptHandle"]
                    )
                    return {
                        "statusCode": 200,
                        "body": json.dumps({"message": body.get("message")})
                    }

        return {"statusCode": 200, "body": json.dumps({"message": None})}

    return {"statusCode": 405, "body": "Method not allowed"}
