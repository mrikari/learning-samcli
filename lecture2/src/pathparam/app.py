import json

def lambda_handler(event, context):
    # path parameter
    path_param = event["pathParameters"]["message"]
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Nice PathParam message: {path_param}.',
        })
    }
