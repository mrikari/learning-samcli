# lecture9

このプロジェクトには、SAM CLIでデプロイできるサーバーレスアプリケーションのソースコードとサポートファイルが含まれています。以下のファイルとフォルダが含まれています：

- functions - 株式の価値をチェック、購入、売却するためのアプリケーションのLambda関数のコード
- statemachines - 株式取引ワークフローをオーケストレーションするステートマシンの定義
- tests - Lambda関数のアプリケーションコードのユニットテスト
- template.yaml - アプリケーションのAWSリソースを定義するテンプレート

このアプリケーションは、事前定義されたスケジュールで実行されるモック株式取引ワークフローを作成します（課金を避けるため、スケジュールはデフォルトで無効化されています）。Step Functionsの機能を活用して、Lambda関数やその他のAWSリソースをオーケストレーションし、Amazon EventBridgeを使用したイベント駆動型開発と組み合わせることで、複雑で堅牢なワークフローを構築する方法を示しています。

AWS Step Functionsを使用すると、複数のAWSサービスをサーバーレスワークフローに調整して、アプリケーションを迅速に構築および更新できます。Step Functionsを使用して、AWS Lambda、AWS Fargate、Amazon SageMakerなどのサービスを組み合わせて、機能豊富なアプリケーションを設計および実行できます。

このアプリケーションは、Step Functionsステートマシン、Lambda関数、EventBridgeルールトリガーなど、複数のAWSリソースを使用しています。これらのリソースは、このプロジェクトの`template.yaml`ファイルで定義されています。テンプレートを更新して、アプリケーションコードを更新するのと同じデプロイメントプロセスを通じてAWSリソースを追加できます。

アプリケーション内のLambda関数を構築およびテストするために統合開発環境（IDE）を使用したい場合は、AWS Toolkitを使用できます。AWS Toolkitは、人気のあるIDE用のオープンソースプラグインで、SAM CLIを使用してAWSでサーバーレスアプリケーションを構築およびデプロイします。AWS Toolkitは、Lambda関数コードのステップスルーデバッグ体験も簡素化します。以下のリンクから始めることができます：

* [CLion](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [GoLand](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [WebStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [Rider](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PhpStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [RubyMine](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [DataGrip](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
* [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

AWS Toolkit for VS Codeには、ステートマシンの可視化の完全なサポートが含まれており、構築中にリアルタイムでステートマシンを視覚化できます。AWS Toolkit for VS Codeには、Amazon States Language用の言語サーバーが含まれており、ステートマシン定義をリントして一般的なエラーを強調表示し、各ステートの自動補完サポートとコードスニペットを提供して、ステートマシンをより迅速に構築できるようにします。

## サンプルアプリケーションのデプロイ

Serverless Application Model Command Line Interface（SAM CLI）は、Lambdaアプリケーションのビルドとテストのための機能を追加するAWS CLIの拡張機能です。Lambdaと一致するAmazon Linux環境で関数を実行するためにDockerを使用します。

SAM CLIを使用するには、以下のツールが必要です：

* SAM CLI - [SAM CLIのインストール](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* [Python 3のインストール](https://www.python.org/downloads/)
* Docker - [Docker Community Editionのインストール](https://hub.docker.com/search/?type=edition&offering=community)

アプリケーションを初めてビルドしてデプロイするには、シェルで以下を実行します：

```bash
sam build --use-container
sam deploy --guided
```

最初のコマンドはアプリケーションのソースをビルドします。2番目のコマンドは、一連のプロンプトでアプリケーションをAWSにパッケージ化してデプロイします：

* **Stack Name**: CloudFormationにデプロイするスタックの名前。これはアカウントとリージョンで一意である必要があり、プロジェクト名に一致するものを始点とすることをお勧めします。
* **AWS Region**: アプリケーションをデプロイするAWSリージョン。
* **Confirm changes before deploy**: yesに設定すると、変更セットが手動レビューのために実行前に表示されます。noに設定すると、AWS SAM CLIは自動的にアプリケーションの変更をデプロイします。
* **Allow SAM CLI IAM role creation**: この例を含む多くのAWS SAMテンプレートは、含まれるAWS Lambda関数がAWSサービスにアクセスするために必要なAWS IAMロールを作成します。デフォルトでは、これらは最小限の必要な権限に制限されています。IAMロールを作成または変更するAWS CloudFormationスタックをデプロイするには、`capabilities`の`CAPABILITY_IAM`値を提供する必要があります。このプロンプトを通じて権限が提供されない場合、この例をデプロイするには、`sam deploy`コマンドに`--capabilities CAPABILITY_IAM`を明示的に渡す必要があります。
* **Save arguments to samconfig.toml**: yesに設定すると、選択した内容がプロジェクト内の設定ファイルに保存され、将来はパラメータなしで`sam deploy`を再実行するだけでアプリケーションの変更をデプロイできます。

## SAM CLIを使用してローカルでビルド

`sam build --use-container`コマンドでアプリケーション内のLambda関数をビルドします。

```bash
lecture9$ sam build --use-container
```

SAM CLIは`functions/*/requirements.txt`で定義された依存関係をインストールし、デプロイメントパッケージを作成して`.aws-sam/build`フォルダに保存します。

## アプリケーションにリソースを追加
アプリケーションテンプレートはAWS Serverless Application Model（AWS SAM）を使用してアプリケーションリソースを定義します。AWS SAMは、関数、トリガー、APIなどの一般的なサーバーレスアプリケーションリソースの設定のためのより単純な構文を持つAWS CloudFormationの拡張機能です。[SAM仕様](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md)に含まれていないリソースについては、標準の[AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)リソースタイプを使用できます。

## Lambda関数のログの取得、追跡、フィルタリング

トラブルシューティングを簡素化するために、SAM CLIには`sam logs`というコマンドがあります。`sam logs`を使用すると、コマンドラインからデプロイされたLambda関数によって生成されたログを取得できます。ターミナルにログを出力することに加えて、このコマンドにはバグをすばやく見つけるのに役立つ便利な機能がいくつかあります。

`注意`: このコマンドは、SAMを使用してデプロイしたものだけでなく、すべてのAWS Lambda関数で機能します。

```bash
lecture9$ sam logs -n StockCheckerFunction --stack-name "lecture9" --tail
```

Lambda関数のログのフィルタリングに関する詳細と例は、[SAM CLIドキュメント](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html)で見つけることができます。

## テスト

テストはこのプロジェクトの`tests`フォルダで定義されています。PIPを使用してテストの依存関係をインストールし、テストを実行します。

```bash
lecture9$ pip install -r tests/requirements.txt --user
# ユニットテスト
lecture9$ python -m pytest tests/unit -v
# 統合テスト（スタックをデプロイした後に必要）
# テスト対象のスタック名でAWS_SAM_STACK_NAME環境変数を作成
lecture9$ AWS_SAM_STACK_NAME="lecture9" python -m pytest tests/integration -v
```

## クリーンアップ

作成したサンプルアプリケーションを削除するには、AWS CLIを使用します。プロジェクト名をスタック名として使用したと仮定すると、以下を実行できます：

```bash
sam delete --stack-name "lecture9"
```

## リソース

SAM仕様、SAM CLI、サーバーレスアプリケーションの概念の紹介については、[AWS SAM開発者ガイド](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)を参照してください。

次に、AWS Serverless Application Repositoryを使用して、hello worldサンプルを超えた準備が整ったアプリをデプロイし、作者がアプリケーションをどのように開発したかを学ぶことができます：[AWS Serverless Application Repositoryメインページ](https://aws.amazon.com/serverless/serverlessrepo/)
