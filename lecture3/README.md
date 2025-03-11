# lecture2

このプロジェクトには、SAM CLIでデプロイできるサーバーレスアプリケーションのソースコードとサポートファイルが含まれています。以下のファイルとフォルダが含まれています。

- todo - アプリケーションのLambda関数のコード。
- events - 関数を呼び出すためのイベント。
- tests - アプリケーションコードの単体テスト。
- template.yaml - アプリケーションのAWSリソースを定義するテンプレート。

アプリケーションは、Lambda関数やAPI Gateway APIなど、いくつかのAWSリソースを使用します。これらのリソースは、このプロジェクトの`template.yaml`ファイルで定義されています。テンプレートを更新して、同じデプロイプロセスを通じてAWSリソースを追加することができます。

## サンプルアプリケーションのデプロイ

Serverless Application Model Command Line Interface (SAM CLI) は、Lambdaアプリケーションの構築とテストのための機能を追加するAWS CLIの拡張です。Dockerを使用して、Lambdaと一致するAmazon Linux環境で関数を実行します。また、アプリケーションのビルド環境とAPIをエミュレートすることもできます。

SAM CLIを使用するには、以下のツールが必要です。

* SAM CLI - [SAM CLIのインストール](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* [Python 3のインストール](https://www.python.org/downloads/)
* Docker - [Dockerコミュニティエディションのインストール](https://hub.docker.com/search/?type=edition&offering=community)

アプリケーションを初めて構築およびデプロイするには、シェルで次のコマンドを実行します。

```bash
sam build
sam deploy --guided
```

最初のコマンドはアプリケーションのソースをビルドします。2番目のコマンドは、アプリケーションをAWSにパッケージ化してデプロイし、一連のプロンプトを表示します。

* **Stack Name**: CloudFormationにデプロイするスタックの名前。アカウントとリージョンに固有である必要があり、プロジェクト名に一致する名前が良いでしょう。
* **AWS Region**: アプリケーションをデプロイするAWSリージョン。
* **Confirm changes before deploy**: 「yes」に設定すると、実行前に変更セットが表示され、手動で確認できます。「no」に設定すると、AWS SAM CLIはアプリケーションの変更を自動的にデプロイします。
* **Allow SAM CLI IAM role creation**: 多くのAWS SAMテンプレート（この例を含む）は、AWSサービスにアクセスするために必要なAWS IAMロールを作成します。デフォルトでは、これらは最小限の必要な権限にスコープダウンされています。IAMロールを作成または変更するAWS CloudFormationスタックをデプロイするには、`capabilities`に`CAPABILITY_IAM`値を提供する必要があります。このプロンプトを通じて許可が提供されない場合、この例をデプロイするには、`sam deploy`コマンドに`--capabilities CAPABILITY_IAM`を明示的に渡す必要があります。
* **Save arguments to samconfig.toml**: 「yes」に設定すると、選択内容がプロジェクト内の構成ファイルに保存され、将来的にパラメータなしで`sam deploy`を再実行してアプリケーションの変更をデプロイできます。

デプロイ後に表示される出力値で、API GatewayエンドポイントURLを確認できます。

## SAM CLIを使用してローカルでビルドおよびテスト

`sam build`コマンドでアプリケーションをビルドします。

```bash
lecture2$ sam build
```

SAM CLIは、`todo/requirements.txt`に定義された依存関係をインストールし、デプロイパッケージを作成し、`.aws-sam/build`フォルダに保存します。

テストイベントを使用して単一の関数を直接呼び出してテストします。イベントは、関数がイベントソースから受け取る入力を表すJSONドキュメントです。テストイベントは、このプロジェクトの`events`フォルダに含まれています。

`sam local invoke`コマンドを使用してローカルで関数を実行し、呼び出します。

```bash
lecture2$ sam local invoke ListTodosFunction --event events/event.json
```

SAM CLIはアプリケーションのAPIもエミュレートできます。`sam local start-api`を使用して、ローカルでポート3000でAPIを実行します。

```bash
lecture2$ sam local start-api
lecture2$ curl http://localhost:3000/todos
```

SAM CLIはアプリケーションテンプレートを読み取り、APIのルートとそれらが呼び出す関数を決定します。各関数の定義の`Events`プロパティには、各パスのルートとメソッドが含まれています。

```yaml
      Events:
        ListTodo:
          Type: Api
          Properties:
            Path: /todos
            Method: get
```

## アプリケーションにリソースを追加

アプリケーションテンプレートは、AWS Serverless Application Model (AWS SAM) を使用してアプリケーションリソースを定義します。AWS SAMは、関数、トリガー、およびAPIなどの一般的なサーバーレスアプリケーションリソースを構成するための簡単な構文を持つAWS CloudFormationの拡張です。[SAM仕様](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md)に含まれていないリソースについては、標準の[AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)リソースタイプを使用できます。

## Lambda関数のログを取得、追跡、およびフィルタリング

トラブルシューティングを簡素化するために、SAM CLIには`sam logs`というコマンドがあります。`sam logs`を使用すると、デプロイされたLambda関数によって生成されたログをコマンドラインから取得できます。このコマンドは、ターミナルにログを表示するだけでなく、バグを迅速に見つけるのに役立ついくつかの便利な機能を備えています。

`注意`: このコマンドは、SAMを使用してデプロイされたLambda関数だけでなく、すべてのAWS Lambda関数に対して機能します。

```bash
lecture2$ sam logs -n ListTodosFunction --stack-name "lecture2" --tail
```

Lambda関数のログのフィルタリングに関する詳細情報と例については、[SAM CLIドキュメント](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html)を参照してください。

## テスト

テストは、このプロジェクトの`tests`フォルダに定義されています。PIPを使用してテスト依存関係をインストールし、テストを実行します。

```bash
lecture2$ pip install -r tests/requirements.txt --user

# 統合テスト（スタックをデプロイする必要があります）
# テストするスタックの名前を持つ環境変数AWS_SAM_STACK_NAMEを作成します
lecture2$ AWS_SAM_STACK_NAME="lecture2" python -m pytest tests/integration -v
```

## クリーンアップ

作成したサンプルアプリケーションを削除するには、AWS CLIを使用します。プロジェクト名をスタック名として使用した場合、次のコマンドを実行できます。

```bash
sam delete --stack-name "lecture2"
```

## リソース

SAM仕様、SAM CLI、およびサーバーレスアプリケーションの概念についての紹介は、[AWS SAM開発者ガイド](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)を参照してください。

次に、AWS Serverless Application Repositoryを使用して、hello worldサンプルを超えたアプリケーションをデプロイし、著者がどのようにアプリケーションを開発したかを学ぶことができます: [AWS Serverless Application Repositoryメインページ](https://aws.amazon.com/serverless/serverlessrepo/)
