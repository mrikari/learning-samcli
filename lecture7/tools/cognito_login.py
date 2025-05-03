import boto3
import os
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("COGNITO_USERNAME")
PASSWORD = os.getenv("COGNITO_PASSWORD")
NEW_PASSWORD = os.getenv("COGNITO_NEW_PASSWORD") or PASSWORD
CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
REGION = os.getenv("AWS_REGION")

client = boto3.client("cognito-idp", region_name=REGION)

def login():
    try:
        response = client.initiate_auth(
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": USERNAME,
                "PASSWORD": PASSWORD
            },
            ClientId=CLIENT_ID,
        )

        if "AuthenticationResult" in response:
            print("✅ Login succeeded.")
            print("Access Token:", response["AuthenticationResult"]["AccessToken"])
            print("ID Token:", response["AuthenticationResult"]["IdToken"])
            return

        if response.get("ChallengeName") == "NEW_PASSWORD_REQUIRED":
            print("🔁 Setting new password...")
            challenge_response = client.respond_to_auth_challenge(
                ClientId=CLIENT_ID,
                ChallengeName="NEW_PASSWORD_REQUIRED",
                ChallengeResponses={
                    "USERNAME": USERNAME,
                    "NEW_PASSWORD": NEW_PASSWORD,
                },
                Session=response["Session"]
            )
            print("✅ New password set and login success.")
            print("Access Token:", challenge_response["AuthenticationResult"]["AccessToken"])
            print("ID Token:", challenge_response["AuthenticationResult"]["IdToken"])
            return

        print("❌ Unknown challenge:", response.get("ChallengeName"))

    except client.exceptions.NotAuthorizedException:
        print("❌ Login failed: Incorrect username or password.")
    except client.exceptions.UserNotConfirmedException:
        print("❌ Login failed: User not confirmed.")
    except Exception as e:
        print("❌ Error:", str(e))

if __name__ == "__main__":
    login()
