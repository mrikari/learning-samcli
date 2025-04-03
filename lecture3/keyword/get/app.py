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
    # PathParameter から id を取得
    id_value = event['pathParameters']['id']
    
    # Queryの実行（partition key に対して）
    try:
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('id').eq(id_value)
        )
        items = response.get('Items', [])
        
        if len(items) <= 0:
            return  {
                'statusCode': 404,
                'body': json.dumps({"message": "Keyword not found"})
            }
        return {
            'statusCode': 200,
            'body': json.dumps(items[0])
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
