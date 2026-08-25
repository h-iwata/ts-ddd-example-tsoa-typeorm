# DDD Example - ECサイト注文システム

[![CI](https://github.com/h-iwata/ts-ddd-example-tsoa-typeorm/actions/workflows/ci.yml/badge.svg)](https://github.com/h-iwata/ts-ddd-example-tsoa-typeorm/actions/workflows/ci.yml)

TypeScript + tsoa + InversifyJS + TypeORMを使用したドメイン駆動設計（DDD）のサンプル実装です。

## アプリケーションの流れ

商品を購入するまでの基本フローです。

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ① 商品登録          ② 顧客登録          ③ 配送先設定            │
│  POST /products      POST /customers      PUT /customers/:id/address│
│       │                   │                      │                  │
│       ▼                   ▼                      ▼                  │
│   ┌────────┐         ┌──────────┐          ┌──────────┐            │
│   │ Product │         │ Customer │ ───────▶│ Customer │            │
│   │ 在庫:10 │         │ 住所:なし │          │ 住所:あり │            │
│   └────────┘         └──────────┘          └──────────┘            │
│       │                                          │                  │
│       │              ④ 注文作成                  │                  │
│       │              POST /orders                │                  │
│       │                   │                      │                  │
│       │                   ▼                      │                  │
│       │              ┌─────────┐                 │                  │
│       │              │  Order  │◀────────────────┘                  │
│       │              │ PENDING │  (顧客の住所を引き継ぐ)             │
│       │              │ items:[]│                                    │
│       │              └─────────┘                                    │
│       │                   │                                         │
│       │   ⑤ 商品追加     │                                         │
│       │   POST /orders/:id/items                                    │
│       │        │          │                                         │
│       └────────┼──────────┘                                         │
│                ▼                                                    │
│           ┌─────────┐                                               │
│           │  Order  │                                               │
│           │ PENDING │                                               │
│           │ items:[{商品A, 数量:2}]                                  │
│           └─────────┘                                               │
│                │                                                    │
│                │  ⑥ 注文確定                                        │
│                │  POST /orders/:id/confirm                          │
│                ▼                                                    │
│  ┌────────┐    ┌───────────┐                                        │
│  │ Product │    │   Order   │                                       │
│  │ 在庫:8  │◀───│ CONFIRMED │  ← 在庫引き当て完了                    │
│  └────────┘    └───────────┘                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| ステップ | API | 説明 |
|---------|-----|------|
| ① 商品登録 | `POST /api/products` | 商品名・価格・在庫数を登録 |
| ② 顧客登録 | `POST /api/customers` | 顧客名・メールアドレスを登録 |
| ③ 配送先設定 | `PUT /api/customers/:id/address` | 顧客の配送先住所を設定 |
| ④ 注文作成 | `POST /api/orders` | 顧客IDを指定して注文を作成（PENDING状態） |
| ⑤ 商品追加 | `POST /api/orders/:id/items` | 注文に商品と数量を追加 |
| ⑥ 注文確定 | `POST /api/orders/:id/confirm` | 在庫を引き当てて注文を確定（CONFIRMED状態） |

## 構成の概要

### 3つの集約（Aggregate）

| 集約 | 役割 | 集約ルート |
|------|------|-----------|
| **Product** | 商品と在庫管理 | `src/domain/aggregates/product/Product.ts` |
| **Customer** | 顧客と配送先 | `src/domain/aggregates/customer/Customer.ts` |
| **Order** | 注文と明細 | `src/domain/aggregates/order/Order.ts` |

### 集約間の関係

```
Customer ──────┐
               │ customerId（参照のみ）
               ▼
            Order ◄──────── OrderItem（内包）
               │
               │ productId（参照のみ）
               ▼
           Product
```

**重要なポイント**:
- Order集約はOrderItemを**内包**（同一トランザクションで整合性保証）
- Order → Customer, Order → Product は**IDで参照**（別集約なので直接参照しない）

### 値オブジェクト

| 値オブジェクト | 役割 | 場所 |
|---------------|------|------|
| **Money** | 金額（通貨付き） | `src/domain/shared/value-objects/Money.ts` |
| **Quantity** | 数量（正の整数） | `src/domain/shared/value-objects/Quantity.ts` |
| **Address** | 住所 | `src/domain/shared/value-objects/Address.ts` |
| **Email** | メールアドレス（バリデーション付き） | `src/domain/aggregates/customer/Email.ts` |
| **OrderId** | 注文ID | `src/domain/aggregates/order/OrderId.ts` |
| **ProductId** | 商品ID | `src/domain/aggregates/product/ProductId.ts` |
| **CustomerId** | 顧客ID | `src/domain/aggregates/customer/CustomerId.ts` |
| **OrderStatus** | 注文ステータス（状態遷移ルール付き） | `src/domain/aggregates/order/OrderStatus.ts` |

### ドメインサービスの役割

`src/domain/services/OrderDomainService.ts` は複数の集約をまたぐビジネスルールを実装:

```typescript
// 注文確定時に在庫を引き当て（Order集約 + Product集約）
await orderDomainService.validateAndReserveStock(order);

// キャンセル時に在庫を戻す
await orderDomainService.releaseStock(order);
```

### 注文のライフサイクル

```
PENDING → CONFIRMED → PAID → SHIPPED → DELIVERED
    │         │        │
    └─────────┴────────┴──→ CANCELLED
```

## 起動方法

### 必要な環境

- Docker
- Docker Compose
- make

### 初回セットアップ

```bash
# 1. コンテナを起動（初回はイメージのビルドが行われます）
make up

# 2. マイグレーションを実行してテーブルを作成
make migrate

# 3. 動作確認
curl http://localhost:3007/api/products
# [] が返れば成功
```

### 通常の起動・停止

```bash
make up       # コンテナ起動
make logs     # ログ確認
make down     # コンテナ停止
```

### Makeコマンド一覧

| コマンド | 説明 |
|---------|------|
| `make up` | コンテナを起動 |
| `make down` | コンテナを停止 |
| `make logs` | アプリログを表示 |
| `make build` | イメージを再ビルドして起動 |
| `make ps` | コンテナの状態を表示 |
| `make migrate` | マイグレーションを実行 |
| `make migrate-generate` | マイグレーションを生成 |
| `make clean` | コンテナとボリュームを削除 |
| `make test` | ユニットテストを実行 |
| `make test-coverage` | カバレッジ付きでテスト |
| `make test-integration` | 統合テストを実行 |
| `make test-all` | 全テストを実行 |
| `make lint` | Biomeでlint |
| `make lint-fix` | lintエラーを自動修正 |
| `make check` | lint・フォーマット・import整列をまとめて検査 |
| `make check-fix` | 上記をまとめて自動修正 |
| `make format` | コードフォーマット |

### Docker構成

- `app`: Node.jsアプリケーション（ポート3007）
- `mysql`: MySQL 8.0（ポート3307）

ソースコードはボリュームマウントされているため、変更がリアルタイムで反映されます。

データベースは2つ作成されます。

| データベース | 用途 | 作成元 |
|---|---|---|
| `ddd_example` | アプリ本体（マイグレーションで管理） | `docker-compose.yml` の `MYSQL_DATABASE` |
| `ddd_example_test` | 統合テスト（各実行時にスキーマを再作成） | `docker/mysql/init/*.sql` |

`docker/mysql/init/` 配下のSQLは MySQL のデータディレクトリが空のとき、つまりボリュームを新規作成したときにのみ実行されます。

## テスト

### テストの種類

| 種類 | コマンド | 説明 |
|------|---------|------|
| ユニットテスト | `make test` | ドメイン層・アプリケーション層のテスト（204件） |
| 統合テスト | `make test-integration` | リポジトリ層のDBアクセス・APIのE2Eテスト（43件） |
| 全テスト | `make test-all` | 上記すべてを実行（247件） |

E2Eテスト（`src/test/e2e/`）は本番と同じ経路（tsoa生成ルート → DIコンテナ → ユースケース → TypeORMリポジトリ → MySQL）を通します。ユニットテストはDIコンテナを経由しないため、`@inject()` の解決やtsoaのルーティングが壊れた場合はE2Eテストだけが検知できます。

統合テストはアプリ本体とは別の `ddd_example_test` に接続し、実行のたびにスキーマを再作成します（`src/infrastructure/database/dataSource.ts` の `synchronize` / `dropSchema`）。そのため `make migrate` は不要で、アプリ側のデータにも影響しません。

### テスト実行

```bash
# コンテナを起動
make up

# ユニットテスト
make test

# カバレッジ付き
make test-coverage

# 統合テスト
make test-integration

# 全テスト
make test-all
```

※ すべてのテストはDocker上で実行されます。事前に `make up` でコンテナを起動してください。

### テストファクトリ

テストデータの生成には[fishery](https://github.com/thoughtbot/fishery)ライブラリを使用しています（RailsのFactoryBot相当）。

```typescript
// ユニットテスト用（既存IDで再構築）
const customer = customerFactory.build();
const product = productFactory.build({ transient: { price: 500 } });

// 統合テスト用（新規作成、IDは自動生成）
const customer = newCustomerFactory.build();
const product = newProductFactory.build({}, { transient: { stock: 100 } });
```

ファクトリは `src/test/factories/` に配置されています。

### カバレッジ

ドメイン層は100%のカバレッジを維持しています。

```bash
# カバレッジレポートを生成
make test-coverage

# HTMLレポートは coverage/index.html で確認可能
```

**カバレッジ閾値**

| 対象 | statements | branches | functions | lines |
|------|------------|----------|-----------|-------|
| **グローバル** | 85% | 50% | 100% | 95% |
| `src/domain/aggregates/` | 100% | 100% | 100% | 100% |
| `src/domain/shared/` | 100% | 100% | 100% | 100% |

**ドメイン層カバレッジ（実測値）**

| レイヤー | statements | branches | functions | lines |
|---------|------------|----------|-----------|-------|
| domain/aggregates/customer | 100% | 100% | 100% | 100% |
| domain/aggregates/order | 100% | 100% | 100% | 100% |
| domain/aggregates/product | 100% | 100% | 100% | 100% |
| domain/shared/value-objects | 100% | 100% | 100% | 100% |
| domain/shared/errors | 100% | 100% | 100% | 100% |
| domain/services | 92.59% | 61.9% | 100% | 97.77% |

> **Note**: `domain/services` の branches カバレッジが低いのは、InversifyJS の `@injectable()` デコレータが生成する分岐がカバレッジに含まれるためです。実際のビジネスロジックは全てテストされています。

**全体サマリー**

| メトリクス | カバレッジ |
|-----------|-----------|
| Statements | 93.59% (760/812) |
| Branches | 62.23% (323/519) |
| Functions | 100% (221/221) |
| Lines | 98.18% (702/715) |

> **Note**: グローバルの branches カバレッジが低い主な理由:
> - TypeScript デコレータ（`@injectable()`, `@inject()` 等）がトランスパイル時に生成する分岐コード
> - 参考: [ts-jest issue #4538](https://github.com/kulshekhar/ts-jest/issues/4538)

**カバレッジ対象**
- `src/domain/**/*.ts` - ドメイン層全体
- `src/application/use-cases/**/*.ts` - ユースケース

**除外対象**
- `src/**/index.ts` - バレルファイル
- `src/domain/repositories/**` - インターフェース定義のみ

## コード品質

### Lint・フォーマット

[Biome](https://biomejs.dev/) に統一しています（ESLint・Prettierは使用していません）。lint、フォーマット、import整列を単一の設定ファイル `biome.json` で扱います。

```bash
# lint・フォーマット・import整列をまとめて検査
make check

# まとめて自動修正
make check-fix

# 個別に実行
make lint
make lint-fix
make format
```

### 主要なメトリクスルール

| ルール | 閾値 | 説明 |
|--------|------|------|
| `noExcessiveLinesPerFunction` | 10 | 関数の行数 |
| `useMaxParams` | 5 | パラメータ数 |
| `noExcessiveCognitiveComplexity` | 7 | 認知的複雑度 |
| `noExcessiveNestedCallbacks` | 3 | コールバックのネスト |

関数の行数はレイヤー別に緩和されます（集約・DTO・ユースケース 15、コントローラー 20、リポジトリ 25、ミドルウェア 40、DI・マイグレーション・テストは無制限）。設定は `biome.json` の `overrides` を参照してください。

型情報を要する厳格ルールは `nursery` グループから `noFloatingPromises` / `noMisusedPromises` / `useAwaitThenable` / `useExplicitReturnType` を有効化しています。

> **補足**: InversifyJSの `@inject()` を解析するため `javascript.parser.unsafeParameterDecoratorsEnabled` を有効にしています。

### CI

GitHub Actions（[.github/workflows/ci.yml](.github/workflows/ci.yml)）で、`master` へのpushとPRごとに以下を実行します。

| ステップ | 内容 |
|---|---|
| `npm run tsoa:generate` | `generated/` はgit管理外のため最初に生成 |
| `npm run check` | Biomeでlint・フォーマット・import整列 |
| `npm run typecheck` | テストを含めた型チェック |
| `npm run build` | 本番ビルド |
| `npm run migration:run` | マイグレーションが適用できることを確認 |
| `npm run test:coverage` | ユニットテスト（カバレッジ閾値つき） |
| `npm run test:integration` | 統合テスト・E2Eテスト |
| `npm start` | ビルド成果物が起動しAPIを返せることを確認 |

MySQLはサービスコンテナとして起動します。`make` コマンドは `docker compose exec` を前提とするため、CIではnpmスクリプトを直接呼びます。Nodeのバージョンは [.nvmrc](.nvmrc) から読み込むので、ローカル・Docker・CIで揃います。

### アクセス

- API: http://localhost:3007
- Swagger UI: http://localhost:3007/docs

## API一覧

### 商品（Product）

| HTTP | エンドポイント | 説明 |
|------|---------------|------|
| POST | `/api/products` | 商品作成 |
| GET | `/api/products` | 全商品取得 |
| GET | `/api/products/:id` | 商品取得 |

### 顧客（Customer）

| HTTP | エンドポイント | 説明 |
|------|---------------|------|
| POST | `/api/customers` | 顧客作成 |
| GET | `/api/customers/:id` | 顧客取得 |
| PUT | `/api/customers/:id/address` | 配送先設定 |

### 注文（Order）

| HTTP | エンドポイント | 説明 |
|------|---------------|------|
| POST | `/api/orders` | 注文作成 |
| GET | `/api/orders/:id` | 注文取得 |
| GET | `/api/orders/customer/:customerId` | 顧客の注文一覧 |
| POST | `/api/orders/:id/items` | 商品追加 |
| POST | `/api/orders/:id/confirm` | 注文確定（在庫引当） |
| POST | `/api/orders/:id/cancel` | キャンセル（在庫戻し） |

## フォルダ構成

```
src/
├── domain/                    # ドメイン層（ビジネスロジックの中核）
│   ├── aggregates/            # 集約
│   │   ├── customer/          # Customer集約
│   │   │   └── errors/        # 顧客ドメインエラー
│   │   ├── order/             # Order集約（OrderItem含む）
│   │   │   └── errors/        # 注文ドメインエラー
│   │   └── product/           # Product集約
│   │       └── errors/        # 商品ドメインエラー
│   ├── shared/                # 共有ドメインオブジェクト
│   │   ├── value-objects/     # 値オブジェクト（Money, Quantity, Address）
│   │   └── errors/            # 共通ドメインエラー
│   ├── repositories/          # リポジトリインターフェース
│   └── services/              # ドメインサービス
│
├── application/               # アプリケーション層（ユースケース）
│   ├── use-cases/             # ユースケース（11個）
│   │   ├── customer/          # 顧客関連（3個）
│   │   ├── order/             # 注文関連（6個）
│   │   └── product/           # 商品関連（3個）
│   └── dtos/                  # データ転送オブジェクト
│
├── infrastructure/            # インフラストラクチャ層
│   ├── repositories/          # リポジトリ実装（MySQL）
│   ├── database/              # TypeORM設定・エンティティ
│   │   ├── dataSource.ts      # DB接続設定
│   │   └── entities/          # ORMエンティティ
│   └── di/                    # DIコンテナ設定（InversifyJS）
│
├── presentation/              # プレゼンテーション層
│   ├── controllers/           # tsoaコントローラー
│   ├── middlewares/           # エラーハンドラー等
│   └── types/                 # レスポンス型定義
│
└── test/                      # テスト設定
    ├── factories/             # テストファクトリ（fishery）
    ├── helpers/               # テストヘルパー
    ├── setup.ts               # ユニットテスト用セットアップ
    └── integration/           # 統合テスト用セットアップ

generated/                     # tsoa自動生成ファイル（.gitignore対象）
├── routes.ts                  # ルーティング定義
└── swagger.json               # OpenAPI仕様

.local/                        # 作業用の一時ファイル置き場（.gitignore対象）
```

`.local/` は調査メモや生成物などの一時ファイルを置くためのディレクトリです。コミット対象外のため、リポジトリを汚さずに作業できます。

## 依存関係の方向

```
Presentation → Application → Domain（Interface）
                                    ↑ implements
                              Infrastructure
```

**例: リポジトリの依存関係**
```
Application層                Domain層                    Infrastructure層
     │                          │                              │
CreateOrderUseCase ───→ IOrderRepository ←─────────── OrderRepository
     │                    (interface)                   (implements)
     └──────────────────→ Order, OrderItem
```

- **Domain層**は何にも依存しない（純粋なビジネスロジック）
- **Domain層**にインターフェース（`IOrderRepository`等）を定義
- **Infrastructure層**がそのインターフェースを実装（依存性逆転）
- **Application層**はインターフェースに依存し、実行時にDIで実装を注入

## 技術スタック

| ライブラリ | バージョン | 役割 |
|-----------|-----------|------|
| **Node.js** | 22 | JavaScript実行環境 |
| **TypeScript** | ^5.7.3 | 型安全な開発 |
| **Express** | ^4.21.2 | HTTPサーバー |
| **tsoa** | ^6.6.0 | OpenAPI仕様の自動生成とルーティング |
| **InversifyJS** | ^7.0.1 | DIコンテナ（依存性注入） |
| **TypeORM** | ^0.3.20 | ORM（Object-Relational Mapping） |
| **MySQL2** | ^3.12.0 | MySQLドライバ |
| **Jest** | ^29.7.0 | テストフレームワーク |
| **fishery** | ^2.2.2 | テストファクトリ（FactoryBot相当） |
| **swagger-ui-express** | ^5.0.1 | Swagger UIの提供 |
| **uuid** | ^11.0.5 | UUID生成 |
