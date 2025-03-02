import os
import json
import click
from pydantic import BaseModel
from typing import List

# モデルのインポート
import models

@click.command()
@click.argument('name')
def generate_json_schema(name: str):
    # モデルクラスの取得
    model_class = getattr(models, name, None)
    if not model_class or not issubclass(model_class, BaseModel):
        raise ValueError(f"Model {name} not found or is not a valid Pydantic model")

    # JSON Schemaの生成
    schema = model_class.model_json_schema()

    # JSON Schemaを指定されたディレクトリに保存
    function_dir = os.path.join(os.path.dirname(__file__), '..', 'todo', name)
    os.makedirs(function_dir, exist_ok=True)
    schema_file_path = os.path.join(function_dir, 'schema.py')
    with open(schema_file_path, 'w') as f:
        f.write(f"schema = {json.dumps(schema, indent=2)}")

    click.echo(f"JSON Schema for {name} has been written to {schema_file_path}")

if __name__ == '__main__':
    generate_json_schema()
