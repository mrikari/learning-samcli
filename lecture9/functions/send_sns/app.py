import os
import boto3
import urllib.parse

approval_api_base = os.environ["APPROVAL_API_BASE_URL"]


def lambda_handler(event, context):
    sns = boto3.client("sns")
    token = urllib.parse.quote(event["token"])  # URL セーフ
    request_id = event.get("requestId", "unknown")

    approve_url = f"{approval_api_base}/approve?token={token}&requestId={request_id}"
    reject_url = f"{approval_api_base}/reject?token={token}&requestId={request_id}"

    message = f"""\
    承認依頼を受け取りました。

    承認または却下を以下のリンクから選択してください：

    ✅ 承認
    {approve_url}

    ❌ 却下
    {reject_url}

    --- 
    本メールは自動送信されています。
    """


    sns.publish(
        TopicArn=os.environ["TOPIC_ARN"],
        Subject="【要対応】承認が必要です",
        Message=message
    )

    return {"status": "sent"}
