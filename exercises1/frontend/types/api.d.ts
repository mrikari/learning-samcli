/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/todos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * TODO一覧取得
         * @description 登録されているすべてのTODOを取得します。
         */
        get: operations["getTodos"];
        put?: never;
        /**
         * TODO作成
         * @description 新しいTODOを作成します。
         */
        post: operations["createTodo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/todos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 取得・更新・削除対象のTODOのUUID */
                id: string;
            };
            cookie?: never;
        };
        /**
         * TODO詳細取得
         * @description 指定したUUIDのTODOを取得します。
         */
        get: operations["getTodoById"];
        /**
         * TODO更新
         * @description 指定したUUIDのTODOを更新します。
         */
        put: operations["updateTodoById"];
        post?: never;
        /**
         * TODO削除
         * @description 指定したUUIDのTODOを削除します。
         */
        delete: operations["deleteTodoById"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description TODOの情報を表します */
        Todo: {
            /**
             * Format: uuid
             * @description TODOの一意なUUID
             * @example 550e8400-e29b-41d4-a716-446655440000
             */
            id: string;
            /**
             * @description TODOのタイトル
             * @example 買い物に行く
             */
            title: string;
            /**
             * @description 詳細な説明（省略可能）
             * @example 牛乳と卵を忘れずに
             */
            description?: string;
            /**
             * Format: date
             * @description 期限の日付（YYYY-MM-DD）
             * @example 2025-04-10
             */
            due_date?: string;
            /**
             * @description 完了フラグ（true: 完了, false: 未完了）
             * @example false
             */
            is_completed: boolean;
            /**
             * @description 優先度（low: 低, medium: 中, high: 高）
             * @example medium
             * @enum {string}
             */
            priority?: "low" | "medium" | "high";
            /** @description タグ一覧（最大10個まで） */
            tags?: string[];
        };
        /** @description 新規作成用のTODOデータ */
        TodoCreate: {
            /**
             * @description TODOのタイトル（必須）
             * @example 掃除をする
             */
            title: string;
            /**
             * @description TODOの説明（任意）
             * @example 部屋とリビングを掃除
             */
            description?: string;
            /**
             * Format: date
             * @description TODOの期限（YYYY-MM-DD、任意）
             * @example 2025-04-10
             */
            due_date?: string;
            /**
             * @description 優先度（任意）
             * @default medium
             * @example high
             * @enum {string}
             */
            priority: "low" | "medium" | "high";
            /** @description タグ一覧（任意、最大10個） */
            tags?: string[];
        };
        /** @description TODO更新用のデータ */
        TodoUpdate: {
            /** @description タイトル（任意） */
            title?: string;
            /** @description 説明（任意） */
            description?: string;
            /**
             * Format: date
             * @description 期限（任意）
             */
            due_date?: string;
            /** @description 完了フラグ（任意） */
            is_completed?: boolean;
            /**
             * @description 優先度（任意）
             * @enum {string}
             */
            priority?: "low" | "medium" | "high";
            /** @description タグ一覧（任意、最大10個） */
            tags?: string[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getTodos: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description TODOリストを正常に取得しました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Todo"][];
                };
            };
            /** @description 不正なリクエストです */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createTodo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TodoCreate"];
            };
        };
        responses: {
            /** @description TODOが作成されました */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Todo"];
                };
            };
            /** @description リクエストが不正です */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getTodoById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 取得・更新・削除対象のTODOのUUID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description TODOを正常に取得しました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Todo"];
                };
            };
            /** @description 指定されたTODOが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    updateTodoById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 取得・更新・削除対象のTODOのUUID */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TodoUpdate"];
            };
        };
        responses: {
            /** @description TODOが正常に更新されました */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Todo"];
                };
            };
            /** @description リクエストが不正です */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 指定されたTODOが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    deleteTodoById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 取得・更新・削除対象のTODOのUUID */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description TODOが正常に削除されました */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 指定されたTODOが見つかりません */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
