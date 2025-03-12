import json
import requests

PLACEHOLDER_URL = "https://jsonplaceholder.typicode.com/users"

def lambda_handler(event, context):
    result = requests.get(PLACEHOLDER_URL)
    return {
        'statusCode': 200,
        'body': result.json()
    }
