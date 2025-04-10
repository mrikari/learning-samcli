"""
API Gatewayの統合テスト

このモジュールはTodo APIのエンドポイントに対する統合テストを提供します。
テストを実行するには、環境変数 AWS_SAM_STACK_NAME にテスト対象のスタック名を設定する必要があります。
"""

import os
import boto3
import pytest
import requests


class TestApiGateway:
    """
    API Gatewayエンドポイントのテストクラス
    
    このクラスはTodo APIの各エンドポイント（GET, POST, PUT, DELETE）に対する
    統合テストを実行します。
    """

    @pytest.fixture()
    def api_gateway_url(self):
        """
        API Gateway URLを取得するためのフィクスチャ
        
        CloudFormationスタックの出力からAPI Gateway URLを取得します。
        環境変数 AWS_SAM_STACK_NAME が設定されている必要があります。
        
        Returns:
            str: API Gateway URL
        
        Raises:
            ValueError: AWS_SAM_STACK_NAME が設定されていない場合
            Exception: スタックが見つからない場合
            KeyError: スタック出力に TodoApi が含まれていない場合
        """
        stack_name = os.environ.get("AWS_SAM_STACK_NAME")

        if stack_name is None:
            raise ValueError('環境変数 AWS_SAM_STACK_NAME にスタック名を設定してください')

        client = boto3.client("cloudformation")

        try:
            response = client.describe_stacks(StackName=stack_name)
        except Exception as e:
            raise Exception(
                f"スタック {stack_name} が見つかりません。\n"
                f'"{stack_name}" という名前のスタックが存在することを確認してください'
            ) from e

        stacks = response["Stacks"]
        stack_outputs = stacks[0]["Outputs"]
        api_outputs = [output for output in stack_outputs if output["OutputKey"] == "TodoApi"]

        if not api_outputs:
            raise KeyError(f"スタック {stack_name} に TodoApi が見つかりません")

        # スタック出力からURLを抽出
        return api_outputs[0]["OutputValue"]

    def test_get_todos(self, api_gateway_url):
        """
        GET /todos エンドポイントのテスト
        
        すべてのTodoアイテムを取得し、レスポンスが正常であることを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        response = requests.get(f"{api_gateway_url}/todos")
        print(f"レスポンスステータスコード: {response.status_code}")
        print(f"レスポンスボディ: {response.text}")
        
        # ステータスコードが200であることを確認
        assert response.status_code == 200
        # レスポンスがリスト形式であることを確認
        assert isinstance(response.json(), list)

    def test_create_todo(self, api_gateway_url):
        """
        POST /todos エンドポイントのテスト
        
        新しいTodoアイテムを作成し、正しく保存されたことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # テスト用のTodoデータ
        payload = {
            "title": "テスト用TODO",
            "description": "これはテスト用のTODOです",
            "due_date": "2025-04-10",
            "priority": "medium",
            "tags": ["テスト", "サンプル"]
        }
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが201（作成成功）であることを確認
        assert response.status_code == 201
        
        # レスポンスデータが正しいことを確認
        data = response.json()
        assert data["title"] == payload["title"]
        assert data["description"] == payload["description"]

    def test_get_todo_by_id(self, api_gateway_url):
        """
        GET /todos/{id} エンドポイントのテスト
        
        特定のIDを持つTodoアイテムを取得し、正しく取得できることを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # まず、テスト用のTodoを作成
        payload = {"title": "テスト用TODO"}
        create_response = requests.post(f"{api_gateway_url}/todos", json=payload)
        todo_id = create_response.json()["id"]

        # 作成したTodoを取得
        response = requests.get(f"{api_gateway_url}/todos/{todo_id}")
        
        # ステータスコードが200であることを確認
        assert response.status_code == 200
        
        # 取得したデータが正しいことを確認
        data = response.json()
        assert data["id"] == todo_id
        assert data["title"] == payload["title"]

    def test_update_todo(self, api_gateway_url):
        """
        PUT /todos/{id} エンドポイントのテスト
        
        既存のTodoアイテムを更新し、正しく更新されたことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # まず、テスト用のTodoを作成
        payload = {"title": "テスト用TODO"}
        create_response = requests.post(f"{api_gateway_url}/todos", json=payload)
        todo_id = create_response.json()["id"]

        # 作成したTodoを更新
        update_payload = {"title": "更新されたTODO", "is_completed": True}
        response = requests.put(f"{api_gateway_url}/todos/{todo_id}", json=update_payload)
        
        # ステータスコードが200であることを確認
        assert response.status_code == 200
        
        # 更新されたデータが正しいことを確認
        data = response.json()
        assert data["title"] == update_payload["title"]
        assert data["is_completed"] is True

    def test_delete_todo(self, api_gateway_url):
        """
        DELETE /todos/{id} エンドポイントのテスト
        
        Todoアイテムを削除し、正しく削除されたことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # まず、テスト用のTodoを作成
        payload = {"title": "テスト用TODO"}
        create_response = requests.post(f"{api_gateway_url}/todos", json=payload)
        todo_id = create_response.json()["id"]

        # 作成したTodoを削除
        response = requests.delete(f"{api_gateway_url}/todos/{todo_id}")
        
        # ステータスコードが204（No Content）であることを確認
        assert response.status_code == 204

        # 削除したTodoが存在しないことを確認
        get_response = requests.get(f"{api_gateway_url}/todos/{todo_id}")
        assert get_response.status_code == 404  # Not Found

    # ==================== エラー処理テスト ====================

    def test_create_todo_missing_required_fields(self, api_gateway_url):
        """
        必須フィールド欠如時のエラー処理テスト
        
        タイトルなしでTodoを作成しようとした場合、APIが400エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # タイトルを含まない不完全なペイロード
        payload = {
            "description": "これは必須フィールドが欠けているTODOです"
        }
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが400（不正なリクエスト）であることを確認
        assert response.status_code == 400

    def test_get_todo_invalid_id(self, api_gateway_url):
        """
        無効なIDでのTodo取得テスト
        
        存在しないIDでTodoを取得しようとした場合、APIが404エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 存在しないと思われるUUID
        invalid_id = "00000000-0000-0000-0000-000000000000"
        
        # GETリクエストを送信
        response = requests.get(f"{api_gateway_url}/todos/{invalid_id}")
        
        # ステータスコードが404（見つからない）であることを確認
        assert response.status_code == 404

    def test_update_todo_invalid_id(self, api_gateway_url):
        """
        無効なIDでのTodo更新テスト
        
        存在しないIDでTodoを更新しようとした場合、APIが404エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 存在しないと思われるUUID
        invalid_id = "00000000-0000-0000-0000-000000000000"
        
        # 更新用ペイロード
        update_payload = {"title": "更新されないTODO"}
        
        # PUTリクエストを送信
        response = requests.put(f"{api_gateway_url}/todos/{invalid_id}", json=update_payload)
        
        # ステータスコードが404（見つからない）であることを確認
        assert response.status_code == 404

    def test_delete_todo_invalid_id(self, api_gateway_url):
        """
        無効なIDでのTodo削除テスト
        
        存在しないIDでTodoを削除しようとした場合、APIが404エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 存在しないと思われるUUID
        invalid_id = "00000000-0000-0000-0000-000000000000"
        
        # DELETEリクエストを送信
        response = requests.delete(f"{api_gateway_url}/todos/{invalid_id}")
        
        # ステータスコードが404（見つからない）であることを確認
        assert response.status_code == 404

    def test_update_todo_invalid_data(self, api_gateway_url):
        """
        無効なデータでのTodo更新テスト
        
        無効な優先度値でTodoを更新しようとした場合、APIが400エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # まず、テスト用のTodoを作成
        payload = {"title": "テスト用TODO"}
        create_response = requests.post(f"{api_gateway_url}/todos", json=payload)
        todo_id = create_response.json()["id"]
        
        # 無効な優先度値を含む更新ペイロード
        update_payload = {"priority": "invalid_priority"}
        
        # PUTリクエストを送信
        response = requests.put(f"{api_gateway_url}/todos/{todo_id}", json=update_payload)
        
        # ステータスコードが400（不正なリクエスト）であることを確認
        assert response.status_code == 400

    # ==================== エッジケーステスト ====================

    def test_create_todo_minimum_fields(self, api_gateway_url):
        """
        最小限フィールドでのTodo作成テスト
        
        必須フィールド（タイトル）のみでTodoを作成し、正しく保存されることを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 必須フィールドのみのペイロード
        payload = {"title": "最小限のTODO"}
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが201（作成成功）であることを確認
        assert response.status_code == 201
        
        # レスポンスデータが正しいことを確認
        data = response.json()
        assert data["title"] == payload["title"]
        assert "id" in data
        
        # オプションフィールドがデフォルト値または空であることを確認
        assert data["is_completed"] is False
        assert data["priority"] == "medium"
        assert isinstance(data["tags"], list)
        assert len(data["tags"]) == 0

    def test_create_todo_maximum_length(self, api_gateway_url):
        """
        最大長フィールドでのTodo作成テスト
        
        タイトルと説明が最大長のTodoを作成し、正しく保存されることを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 最大長のタイトルと説明を持つペイロード
        payload = {
            "title": "あ" * 100,  # 100文字のタイトル
            "description": "い" * 500  # 500文字の説明
        }
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが201（作成成功）であることを確認
        assert response.status_code == 201
        
        # レスポンスデータが正しいことを確認
        data = response.json()
        assert data["title"] == payload["title"]
        assert data["description"] == payload["description"]
        assert len(data["title"]) == 100
        assert len(data["description"]) == 500

    def test_update_todo_partial(self, api_gateway_url):
        """
        部分更新テスト
        
        Todoの一部フィールドのみを更新し、他のフィールドが変更されないことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # まず、テスト用のTodoを作成
        create_payload = {
            "title": "部分更新テスト用TODO",
            "description": "これは部分更新のテスト用です",
            "priority": "low",
            "tags": ["テスト", "部分更新"]
        }
        create_response = requests.post(f"{api_gateway_url}/todos", json=create_payload)
        todo_id = create_response.json()["id"]
        
        # タイトルのみを更新
        update_payload = {"title": "部分更新後のTODO"}
        response = requests.put(f"{api_gateway_url}/todos/{todo_id}", json=update_payload)
        
        # ステータスコードが200であることを確認
        assert response.status_code == 200
        
        # 更新されたデータを確認
        data = response.json()
        assert data["title"] == update_payload["title"]  # タイトルが更新されている
        assert data["description"] == create_payload["description"]  # 説明は変更されていない
        assert data["priority"] == create_payload["priority"]  # 優先度は変更されていない
        assert data["tags"] == create_payload["tags"]  # タグは変更されていない

    # ==================== 機能テスト ====================

    def test_create_multiple_todos(self, api_gateway_url):
        """
        複数Todo作成テスト
        
        複数のTodoを作成し、一覧取得で全て表示されることを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 作成前の一覧を取得
        initial_response = requests.get(f"{api_gateway_url}/todos")
        initial_count = len(initial_response.json())
        
        # 3つのTodoを作成
        todos = [
            {"title": "複数作成テスト1", "priority": "low"},
            {"title": "複数作成テスト2", "priority": "medium"},
            {"title": "複数作成テスト3", "priority": "high"}
        ]
        
        created_ids = []
        for todo in todos:
            response = requests.post(f"{api_gateway_url}/todos", json=todo)
            assert response.status_code == 201
            created_ids.append(response.json()["id"])
        
        # 一覧を再取得
        final_response = requests.get(f"{api_gateway_url}/todos")
        final_todos = final_response.json()
        
        # 3つ増えていることを確認
        assert len(final_todos) >= initial_count + 3
        
        # 作成したTodoが全て含まれていることを確認
        found_ids = [todo["id"] for todo in final_todos]
        for created_id in created_ids:
            assert created_id in found_ids

    def test_update_todo_priority(self, api_gateway_url):
        """
        優先度更新テスト
        
        Todoの優先度を変更し、正しく反映されることを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # まず、テスト用のTodoを作成
        create_payload = {"title": "優先度テスト用TODO", "priority": "low"}
        create_response = requests.post(f"{api_gateway_url}/todos", json=create_payload)
        todo_id = create_response.json()["id"]
        
        # 優先度を変更（low → high）
        update_payload = {"priority": "high"}
        response = requests.put(f"{api_gateway_url}/todos/{todo_id}", json=update_payload)
        
        # ステータスコードが200であることを確認
        assert response.status_code == 200
        
        # 優先度が更新されていることを確認
        data = response.json()
        assert data["priority"] == "high"
        
        # 再度取得して確認
        get_response = requests.get(f"{api_gateway_url}/todos/{todo_id}")
        get_data = get_response.json()
        assert get_data["priority"] == "high"

    def test_update_todo_tags(self, api_gateway_url):
        """
        タグ更新テスト
        
        Todoのタグを変更し、正しく反映されることを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # まず、テスト用のTodoを作成
        create_payload = {"title": "タグテスト用TODO", "tags": ["初期タグ"]}
        create_response = requests.post(f"{api_gateway_url}/todos", json=create_payload)
        todo_id = create_response.json()["id"]
        
        # タグを変更
        update_payload = {"tags": ["新しいタグ1", "新しいタグ2"]}
        response = requests.put(f"{api_gateway_url}/todos/{todo_id}", json=update_payload)
        
        # ステータスコードが200であることを確認
        assert response.status_code == 200
        
        # タグが更新されていることを確認
        data = response.json()
        assert len(data["tags"]) == 2
        assert "新しいタグ1" in data["tags"]
        assert "新しいタグ2" in data["tags"]
        assert "初期タグ" not in data["tags"]

    # ==================== バリデーションテスト ====================

    def test_create_todo_title_too_long(self, api_gateway_url):
        """
        タイトル長制限テスト
        
        制限を超える長さのタイトルでTodoを作成しようとした場合、APIが400エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 101文字のタイトル（上限は100文字）
        payload = {"title": "あ" * 101}
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが400（不正なリクエスト）であることを確認
        assert response.status_code == 400

    def test_create_todo_description_too_long(self, api_gateway_url):
        """
        説明長制限テスト
        
        制限を超える長さの説明でTodoを作成しようとした場合、APIが400エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 501文字の説明（上限は500文字）
        payload = {
            "title": "説明長テスト",
            "description": "い" * 501
        }
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが400（不正なリクエスト）であることを確認
        assert response.status_code == 400

    def test_create_todo_invalid_date_format(self, api_gateway_url):
        """
        日付形式テスト
        
        無効な日付形式でTodoを作成しようとした場合、APIが400エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 無効な日付形式
        payload = {
            "title": "日付形式テスト",
            "due_date": "2025/04/10"  # YYYY-MM-DD形式ではない
        }
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが400（不正なリクエスト）であることを確認
        assert response.status_code == 400

    def test_create_todo_too_many_tags(self, api_gateway_url):
        """
        タグ数制限テスト
        
        制限を超える数のタグでTodoを作成しようとした場合、APIが400エラーを返すことを確認します。
        
        Args:
            api_gateway_url: API Gateway URL（フィクスチャから取得）
        """
        # 11個のタグ（上限は10個）
        payload = {
            "title": "タグ数テスト",
            "tags": [f"タグ{i}" for i in range(1, 12)]
        }
        
        # POSTリクエストを送信
        response = requests.post(f"{api_gateway_url}/todos", json=payload)
        
        # ステータスコードが400（不正なリクエスト）であることを確認
        assert response.status_code == 400
