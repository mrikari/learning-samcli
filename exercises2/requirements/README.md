# 面倒ごと共有サービス - 要件分割構成

本ディレクトリは、面倒ごと共有サービスの各マイクロサービス要件を分割管理するためのものです。

## ファイル構成

- `auth_service.yaml` : 認証API（JWT発行）
- `frontend.md` : フロントエンド（統合UI）
- `trouble_service.yaml` : 面倒ごと投稿API
- `comment_service.yaml` : コメントAPI
- `notification_generator.yaml` : 通知生成Lambda
- `notification_dispatcher.yaml` : 通知配信バッチ
- `stats_aggregator.yaml` : 投稿件数集計Lambda
- `dashboard_api.yaml` : ダッシュボードAPI
- `shared_resources.yaml` : 共通リソース（DynamoDB, EventBridge, Secrets, 監視等）

## 参照方法
- 各サービス要件ファイルは、必要な共通リソースを `shared_resources.yaml` で参照してください。
- サービス間の依存関係やトリガーは `dependencies` セクションで明記します。

## 注意事項
- 仕様追加・変更は必ず全体設計者と調整してください。
- サービスごとに担当を分けて実装可能です。

## 技術スタック

### フロントエンド
- Next.js (React, TypeScript)
- Node.js
- S3 + CloudFront (静的ホスティング)
- ESLint, PostCSS

### バックエンド
- AWS Lambda (Python 3.13)
- AWS API Gateway (REST)
- AWS SAM (Serverless Application Model)
- DynamoDB
- EventBridge
- Cognito UserPool + Lambda Authorizer
- S3 (静的ファイル)
- CloudWatch (Logs, Metrics)

### インフラ・CI/CD
- AWS SAM CLI
- AWS CloudFormation (template.yaml)
- S3, CloudFront (backend/template.yaml)
- Git (バージョン管理)

### その他
- JWT (Cognito発行, RS256)
- OpenID Connect (Cognito)
- RESTful API 