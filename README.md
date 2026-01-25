# DDD Example - ECサイト注文システム

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
| **Money** | 金額（通貨付き） | `src/domain/value-objects/Money.ts` |
| **Quantity** | 数量（正の整数） | `src/domain/value-objects/Quantity.ts` |
| **Address** | 住所 | `src/domain/value-objects/Address.ts` |
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
curl http://localhost:3000/api/products
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

### Docker構成

- `app`: Node.jsアプリケーション（ポート3000）
- `mysql`: MySQL 8.0（ポート3307）

ソースコードはボリュームマウントされているため、変更がリアルタイムで反映されます。

### アクセス

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/docs

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
│   │   ├── order/             # Order集約（OrderItem含む）
│   │   └── product/           # Product集約
│   ├── value-objects/         # 値オブジェクト（Money, Quantity, Address）
│   ├── repositories/          # リポジトリインターフェース
│   ├── services/              # ドメインサービス
│   └── events/                # ドメインイベント
│
├── application/               # アプリケーション層（ユースケース）
│   ├── use-cases/             # ユースケース（11個）
│   │   ├── customer/          # 顧客関連（3個）
│   │   ├── order/             # 注文関連（6個）
│   │   └── product/           # 商品関連（3個）
│   └── dtos/                  # データ転送オブジェクト
│
├── infrastructure/            # インフラストラクチャ層
│   ├── repositories/          # リポジトリ実装
│   │   ├── in-memory/         # インメモリ実装（デフォルト）
│   │   └── mysql/             # MySQL実装
│   ├── database/              # TypeORM設定・エンティティ
│   │   ├── dataSource.ts      # DB接続設定
│   │   └── entities/          # ORMエンティティ
│   └── di/                    # DIコンテナ設定（InversifyJS）
│
├── presentation/              # プレゼンテーション層
│   ├── controllers/           # tsoaコントローラー
│   └── middlewares/           # エラーハンドラー等
│
├── shared/                    # 共通モジュール
│   ├── errors/                # カスタムエラー
│   └── types/                 # 共通型定義
│
└── generated/                 # tsoa自動生成ファイル
    ├── routes.ts              # ルーティング定義
    └── swagger.json           # OpenAPI仕様
```

## 依存関係の方向

```
Presentation → Application → Domain ← Infrastructure
                    ↓
              Infrastructure
```

- **Domain層**は何にも依存しない（純粋なビジネスロジック）
- **Infrastructure層**がDomain層のインターフェースを実装（依存性逆転）
- 外側の層は内側の層に依存するが、逆はない

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
| **swagger-ui-express** | ^5.0.1 | Swagger UIの提供 |
| **uuid** | ^11.0.5 | UUID生成 |
