import json
import boto3
import os
import uuid

# Get Endpoint URL from environment variable
endpoint_url = os.environ.get('ENDPOINT_URL')
# Create a DynamoDB client
dynamodb = boto3.resource('dynamodb', endpoint_url=endpoint_url)
# Get the table name from environment variable
table_name = os.environ.get('TABLE_NAME')
# Get the table
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    # Get request body
    body = json.loads(event['body'])
    # Get the keyword from the request body
    keyword = body['keyword']
    # Put the keyword into the table
    response = table.put_item(
        Item={
            "id": str(uuid.uuid4()),
            "keyword": keyword,
        }
    )
    # get the item from the response
    item = response['Item'] if 'Item' in response else response
    # Return the response
    return {
        "statusCode": 200,
        "body": json.dumps(item),
    }
