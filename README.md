# DDD Example - ECサイト注文システム

TypeScript + tsoa + InversifyJSを使用したドメイン駆動設計（DDD）のサンプル実装です。

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

```bash
cd ddd-example
npm install
npm run dev   # tsoa generate + サーバー起動
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

## API一覧

| エンドポイント | 説明 |
|---------------|------|
| `POST /api/products` | 商品作成 |
| `POST /api/customers` | 顧客作成 |
| `PUT /api/customers/:id/address` | 配送先設定 |
| `POST /api/orders` | 注文作成 |
| `POST /api/orders/:id/items` | 商品追加 |
| `POST /api/orders/:id/confirm` | 注文確定（在庫引当） |
| `POST /api/orders/:id/cancel` | キャンセル（在庫戻し） |

## フォルダ構成

```
src/
├── domain/                    # ドメイン層（ビジネスロジックの中核）
│   ├── aggregates/            # 集約
│   │   ├── customer/          # Customer集約
│   │   ├── order/             # Order集約（OrderItem含む）
│   │   └── product/           # Product集約
│   ├── value-objects/         # 値オブジェクト（Money, Email等）
│   ├── repositories/          # リポジトリインターフェース
│   ├── services/              # ドメインサービス
│   └── events/                # ドメインイベント
│
├── application/               # アプリケーション層（ユースケース）
│   ├── use-cases/             # ユースケース
│   │   ├── customer/
│   │   ├── order/
│   │   └── product/
│   └── dtos/                  # データ転送オブジェクト
│
├── infrastructure/            # インフラストラクチャ層
│   ├── repositories/          # リポジトリ実装（InMemory）
│   ├── di/                    # DIコンテナ設定
│   └── database/              # DB接続（実装時）
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

- **TypeScript** - 型安全な開発
- **tsoa** - OpenAPI仕様の自動生成とルーティング
- **InversifyJS** - DIコンテナ
- **Express** - HTTPサーバー
