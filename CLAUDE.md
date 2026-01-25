# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際のガイダンスを提供します。

## コマンド（Makefile）

Docker Compose環境で実行。`make help`で全コマンド一覧を表示。

```bash
# 環境
make up                # コンテナ起動
make down              # コンテナ停止
make build             # イメージ再ビルドして起動
make logs              # ログ表示
make clean             # コンテナとボリューム削除

# テスト
make test              # ユニットテスト
make test-coverage     # カバレッジ付きテスト
make test-integration  # 統合テスト（DB必要）
make test-all          # 全テスト

# Lint・フォーマット
make lint              # ESLint実行
make lint-fix          # ESLint自動修正
make format            # コードフォーマット

# マイグレーション
make migrate           # マイグレーション実行
make migrate-generate  # マイグレーション生成
```

## アーキテクチャ

DDDのレイヤードアーキテクチャを採用:

```
src/
├── domain/           # ドメイン層（ビジネスロジック）
│   ├── aggregates/   # 集約（Customer, Order, Product）
│   ├── services/     # ドメインサービス
│   └── shared/       # 共有値オブジェクト（Money, Quantity, Address）
├── application/      # アプリケーション層
│   ├── use-cases/    # ユースケース
│   └── dtos/         # データ転送オブジェクト
├── infrastructure/   # インフラ層
│   ├── repositories/ # リポジトリ実装（TypeORM）
│   └── database/     # DB設定・マイグレーション
└── presentation/     # プレゼンテーション層
    ├── controllers/  # tsoaコントローラー
    └── middlewares/  # Expressミドルウェア
```

## コーディング規約

### ESLint設定（RuboCop相当の厳格ルール）

| メトリクス | デフォルト | 説明 |
|-----------|-----------|------|
| complexity | 7 | 循環的複雑度 |
| max-depth | 3 | ネストの深さ |
| max-lines-per-function | 10 | 関数の行数 |
| max-params | 5 | パラメータ数 |
| max-statements | 15 | 文の数 |

### レイヤー別の緩和ルール

- **aggregates**: max-lines 15, max-params 7
- **use-cases**: max-lines 15
- **dtos**: max-lines 15
- **controllers**: max-lines 20, max-params off
- **repositories**: max-lines 25
- **middlewares**: max-lines 40, no-console off
- **migrations/DI/tests**: 制限なし

### 集約のreconstructパターン

集約の再構築にはパラメータオブジェクトパターンを使用:

```typescript
// インターフェース定義
export interface CustomerReconstructParams {
  id: CustomerId;
  name: string;
  email: Email;
  shippingAddress: Address | null;
  createdAt: Date;
  updatedAt: Date;
}

// 使用例
static reconstruct(params: CustomerReconstructParams): Customer {
  return new Customer(params);
}
```

### 型インポート

`type`キーワードを使用したインラインインポートを推奨:

```typescript
import { type Address } from '../../shared/value-objects';
import { CustomerId } from './CustomerId';  // 値として使う場合はtypeなし
```

### 値オブジェクト

- privateコンストラクタ + staticファクトリメソッド（`create`）
- `equals`メソッドで等価性比較
- イミュータブル設計

### エラーハンドリング

ドメイン固有のエラークラスを使用:

```typescript
// 例: src/domain/aggregates/order/errors/
export class EmptyOrderError extends Error { ... }
export class InvalidOrderStatusError extends Error { ... }
```

## テスト

- ユニットテスト: `*.test.ts`
- 統合テスト: `*.integration.test.ts`
- テストファクトリ: `src/test/factories/`（fishery使用）
- RSpecスタイルの`context`ヘルパー: `src/test/helpers/context.ts`

```typescript
// contextヘルパーの使用例
describe('#methodName', () => {
  context('when 条件', () => {
    it('期待する動作', () => { ... });
  });
});
```

## DI（依存性注入）

InversifyJSを使用。コンテナ設定は `src/infrastructure/di/container.ts`。

## API

tsoa + Expressで自動生成。Swagger UIは `/docs` で確認可能。
