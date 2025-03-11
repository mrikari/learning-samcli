import json
import pytest
from convert import app


@pytest.fixture()
def apigw_event():
    """API Gateway の標準的な POST リクエストイベント"""
    return {
        "body": json.dumps({"message": "123"}),  # JSON に変換
        "resource": "/{proxy+}",
        "requestContext": {
            "resourceId": "123456",
            "apiId": "1234567890",
            "resourcePath": "/{proxy+}",
            "httpMethod": "POST",
            "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
            "accountId": "123456789012",
            "identity": {
                "sourceIp": "127.0.0.1",
            },
            "stage": "prod",
        },
        "httpMethod": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "pathParameters": {"proxy": "/examplepath"},
        "queryStringParameters": None,
        "stageVariables": None,
        "path": "/examplepath",
    }


@pytest.mark.parametrize(
    "input_message,expected,expected_status",
    [
        ("123", "１２３", 200),
        ("4567", "４５６７", 200),
        ("0-9", "０－９", 200),
        ("今日の日付は2025/02/17です。", "今日の日付は２０２５／０２／１７です。", 200),
        ("", None, 400),  # 空文字列は 400 Bad Request
        ("全角テスト１２３", "全角テスト１２３", 200),  # すでに全角
    ],
)
def test_lambda_handler_various_cases(input_message, expected, expected_status, apigw_event):
    """さまざまなケースのテスト"""
    event = apigw_event.copy()
    event["body"] = json.dumps({"message": input_message}) if input_message is not None else None

    ret = app.lambda_handler(event, "")
    assert ret["statusCode"] == expected_status

    if expected_status == 200:
        data = json.loads(ret["body"])
        assert "converted_message" in data
        assert data["converted_message"] == expected
    else:
        # 400 の場合はエラーメッセージを含むことを確認
        data = json.loads(ret["body"])
        assert "error" in data
