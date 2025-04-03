import json
import boto3
import os

env = os.environ.get('ENV', 'local')
if env == 'local':
    # Get Endpoint URL from environment variable
    endpoint_url = os.environ.get('ENDPOINT_URL')
else:
    endpoint_url = None

# Create a DynamoDB client
dynamodb = boto3.resource('dynamodb', endpoint_url=endpoint_url)

# Get the table name from environment variable
table_name = os.environ.get('TABLE_NAME')

# Get the table
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    # Scan the table
    response = table.scan(Limit=10)
    items = response['Items'] if 'Items' in response else []
    return {
        "statusCode": 200,
        "body": json.dumps(items),
    }
