# Frontend（統合UI）

## 概要
投稿・コメント・通知情報を統合表示するSvelteKit or Next.jsアプリ。

## ページ構成
- Home: 投稿一覧 + コメントフォーム
- Dashboard: 投稿件数・通知件数などの統計表示

## 利用API
- TroubleService（trouble_service.yaml）
- コメントAPI（comment_service.yaml）
- ダッシュボードAPI（dashboard_api.yaml）
- Auth Service（auth_service.yaml）

## 認証
- Cognito UserPool + Lambda AuthorizerによるJWT（Authorization: Bearer <Cognito発行JWT>）

## 備考
- API仕様・認証方式は各サービス要件ファイルを参照 