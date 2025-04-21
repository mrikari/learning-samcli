# protected-service

AWS SAMを利用したCognito認証付きAPIサービスです。

## 構成

- Cognito UserPool（管理者グループ・一般ユーザーグループ）
- Lambda関数（管理者用・一般ユーザー用）
- API Gateway（Cognito認証付き）
- Lambda Layer（共通ライブラリ）

## ディレクトリ構成

```
.
├── template.yaml         # SAM テンプレート
├── protected/
│   ├── CheckProtect/     # 保護用Lambda
│   └── CommonLayer/      # 共通Layer
├── .aws-sam/             # SAMビルド成果物
└── ...
```

## デプロイ方法

```sh
sam build
sam deploy --guided
```

## 認証フロー

1. ユーザー登録・パスワード設定（Cognito UserPool）
2. AWS CLIでログインしIDトークン取得
3. API呼び出し時にIDトークンをAuthorizationヘッダに付与

## AWS CLIによる認証例

``` shell
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <CLIENT-ID> \
  --auth-parameters "USERNAME=<USERNAME>,PASSWORD=<PASSWORD>"
```

## パスワードの設定

``` shell
aws cognito-idp respond-to-auth-challenge \
  --client-id <CLIENT-ID> \
  --challenge-name NEW_PASSWORD_REQUIRED \
  --challenge-responses "USERNAME=<USERNAME>,PASSWORD=<PASSWORD>" \
  --session "<SESSION-STRING>"
```

## API呼び出し例

### 管理者用API

``` shell
curl -H 'Authorization: Bearer <ID-TOKEN>' https://<API-ID>.execute-api.ap-northeast-1.amazonaws.com/Prod/protected/admin
```

### 一般用API

``` shell
curl -H 'Authorization: Bearer <ID-TOKEN>' https://<API-ID>.execute-api.ap-northeast-1.amazonaws.com/Prod/protected/general
```

## 参考

- [template.yaml](template.yaml)
- [protected/CheckProtect/app.py](protected/CheckProtect/app.py)
- [protected/CommonLayer/requirements.txt](protected/CommonLayer/requirements.txt)
