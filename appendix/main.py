import requests
from plyer import notification
import time

API_KEY = "********"  # API Gatewayで発行されたキー
SERVER = "https://********.execute-api.ap-northeast-1.amazonaws.com/Prod"

def poll_loop():
    while True:
        try:
            resp = requests.get(f"{SERVER}/poll", headers={"x-api-key": API_KEY})
            if resp.status_code == 200:
                data = resp.json()
                message = data.get("message")
                if message:
                    print("通知:", message)
                    notification.notify(
                        title="通知",
                        message=message,
                        timeout=5
                    )
        except Exception as e:
            print("エラー:", e)
        time.sleep(5)

if __name__ == "__main__":
    poll_loop()

# curl -X POST "https://********.execute-api.ap-northeast-1.amazonaws.com/Prod/notify" \
#      -H "x-api-key: ********" \
#      -H "Content-Type: application/json" \
#      -d '{"message": "finished"}'