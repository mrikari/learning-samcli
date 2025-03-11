import json
import re

# 半角から全角への変換マッピング
half_to_full = {
    "/": "／",
    "-": "－",
    "(": "（",
    ")": "）",
    ":": "：",
    ";": "；",
}


def convert_half_to_full(match):
    """半角数字または記号を全角に変換"""
    char = match.group(0)
    if char.isdigit():
        return chr(ord(char) + 0xFEE0)  # 半角数字を全角数字に変換
    return half_to_full.get(char, char)  # 記号の変換（マッピングがない場合はそのまま）


def replace_text(text):
    """半角数字と指定記号を全角に変換"""
    pattern = r"[0-9" + re.escape("".join(half_to_full.keys())) + r"]"
    return re.sub(pattern, convert_half_to_full, text)


def lambda_handler(event, _):
    try:
        body = json.loads(event.get("body", "{}"))
        message = body.get("message")

        if not isinstance(message, str) or not message.strip():
            return {
                "statusCode": 400,
                "body": json.dumps(
                    {
                        "error": "Invalid request. 'message' field is required and must be a non-empty string."
                    }
                ),
            }

        converted_message = replace_text(message)
        return {
            "statusCode": 200,
            "body": json.dumps({"converted_message": converted_message}),
        }

    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid JSON format."}),
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps(
                {"error": str(e)}
            ),
        }
