# トラブル管理システム

## 概要
このプロジェクトは、トラブル管理システムのフロントエンドとバックエンドの実装です。AWS SAMを使用してバックエンドを構築し、Next.jsを使用してフロントエンドを実装しています。

## 技術スタック
### バックエンド
- AWS SAM (Serverless Application Model)
- AWS Lambda
- Amazon API Gateway
- Amazon Cognito
- Amazon DynamoDB
- Amazon S3
- Amazon CloudFront

### フロントエンド
- Next.js (TypeScript)
- Material-UI
- Amazon Cognito Identity SDK
- Axios

## プロジェクト構成
```
.
├── backend/           # バックエンド（AWS SAM）
│   ├── src/          # Lambda関数のソースコード
│   └── template.yaml # SAMテンプレート
└── frontend/         # フロントエンド（Next.js）
    ├── src/          # ソースコード
    ├── public/       # 静的ファイル
    └── scripts/      # ビルド・デプロイスクリプト
```

## セットアップ手順

### 前提条件
- Node.js 18以上
- AWS CLI
- AWS SAM CLI
- AWSアカウントと適切なIAM権限

### バックエンドのデプロイ
1. バックエンドディレクトリに移動
```bash
cd backend
```

2. SAMアプリケーションのビルド
```bash
sam build
```

3. SAMアプリケーションのデプロイ
```bash
sam deploy --guided
```
初回デプロイ時は、以下の情報の入力を求められます：
- Stack Name: スタック名
- AWS Region: デプロイ先リージョン
- Confirm changes before deploy: デプロイ前の確認
- Allow SAM CLI IAM role creation: IAMロールの自動作成の許可
- Save arguments to configuration file: 設定の保存

### フロントエンドの開発
1. フロントエンドディレクトリに移動
```bash
cd frontend
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

### フロントエンドのビルドとデプロイ
1. フロントエンドのビルド
```bash
npm run build
```

2. S3バケットへのデプロイ
```bash
npm run deploy
```

## 環境変数
フロントエンドのビルド時に、以下の環境変数が自動的に設定されます：
- `NEXT_PUBLIC_COGNITO_REGION`: Cognitoのリージョン
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`: CognitoユーザープールID
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`: CognitoクライアントID
- `NEXT_PUBLIC_API_ENDPOINT`: API Gatewayのエンドポイント
- `NEXT_PUBLIC_S3_BUCKET`: フロントエンド用S3バケット名
- `NEXT_PUBLIC_CLOUDFRONT_DOMAIN`: CloudFrontのドメイン名

## 注意事項
1. バックエンドのデプロイには、適切なIAM権限が必要です
2. S3バケットはCloudFront経由でのみアクセス可能です
3. CloudFrontディストリビューションの作成には数分かかる場合があります
4. フロントエンドのデプロイには、S3バケットへの書き込み権限が必要です

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。
