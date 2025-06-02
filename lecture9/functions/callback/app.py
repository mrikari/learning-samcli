import boto3
import json

def lambda_handler(event, context):
    params = event.get("queryStringParameters") or {}
    token = params.get("token")
    request_id = params.get("requestId", "unknown")

    # パス情報を確実に取得（API Gateway v1/v2 互換）
    path = event.get("rawPath") or event.get("path") or ""

    client = boto3.client("stepfunctions")

    if "approve" in path:
        client.send_task_success(
            taskToken=token,
            output=json.dumps({"approved": True, "requestId": request_id})
        )
        return {"statusCode": 200, "body": "承認完了しました。"}
    elif "reject" in path:
        client.send_task_failure(
            taskToken=token,
            error="UserRejected",
            cause="User rejected the request"
        )
        return {"statusCode": 200, "body": "却下されました。"}
    else:
        return {"statusCode": 400, "body": "不正なリクエストパスです。"}
