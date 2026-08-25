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
make check             # lint・フォーマット・import整列をまとめて検査
make check-fix         # まとめて自動修正
make lint              # lintのみ
make lint-fix          # lintのみ自動修正
make format            # フォーマットのみ

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

### Biome設定（`biome.json`）

lint・フォーマット・import整列をBiomeに統一。ESLint・Prettierは使用しない。

| ルール | デフォルト | 説明 |
|-----------|-----------|------|
| noExcessiveLinesPerFunction | 10 | 関数の行数 |
| useMaxParams | 5 | パラメータ数 |
| noExcessiveCognitiveComplexity | 7 | 認知的複雑度 |
| noExcessiveNestedCallbacks | 3 | コールバックのネスト |

### レイヤー別の緩和ルール（`overrides`）

- **aggregates**: 行数 15, パラメータ 7
- **use-cases / dtos**: 行数 15
- **controllers**: 行数 20, パラメータ制限なし
- **repositories**: 行数 25
- **middlewares**: 行数 40, noConsole off
- **migrations / DI / tests**: 行数制限なし

`overrides` は後方の定義が優先されるため、テスト向けの緩和は必ず配列の最後に置く。

### Biome移行時の注意点

- `@inject()` のパースに `javascript.parser.unsafeParameterDecoratorsEnabled: true` が必須
- 抑制コメントは `// biome-ignore lint/<group>/<rule>: 理由` 形式（`eslint-disable` は無効）
- ESLintから引き継げなかったルール: `max-depth`、`max-statements`、循環的複雑度、`strict-boolean-expressions`、`no-unsafe-*`、`restrict-template-expressions`

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
- 統合テスト・E2Eテスト: `*.integration.test.ts`（DBが必要。E2Eは `src/test/e2e/`）
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

## マイグレーション

`make migrate-generate` が生成するファイルはTypeORMの既定スタイルなので、以下を手で直す。

- `public async up` / `public async down` の `public` を削除（`useConsistentMemberAccessibility` に抵触）
- `make check-fix` でフォーマットとimport整列を適用

## トランザクション

複数の集約をまたぐ更新は `ITransactionManager`（`src/domain/repositories/ITransactionManager.ts`）を注入して囲む。
実装は `AsyncLocalStorage` で `EntityManager` を伝播させるため、リポジトリ側は
`getEntityManager().getRepository(X)` を使うだけでトランザクションに参加する。

```typescript
return this.transactionManager.run(async () => {
  const order = await this.orderRepository.findById(id);
  order.confirm();                                       // 書き込み前にドメインルールを検証
  await this.orderDomainService.validateAndReserveStock(order);
  await this.orderRepository.save(order);
  return toOrderResponseDto(order);
});
```

## ビルド

`tsconfig.json` は型チェック用（テストを含む）、`tsconfig.build.json` はビルド用（テストを除外）。

| コマンド | 用途 |
|---|---|
| `npm run typecheck` | `tsc --noEmit`。テストも含めて型チェック |
| `npm run build` | `tsconfig.build.json` でビルド。`postbuild` で `swagger.json` を dist へコピー |
| `npm start` | `node dist/src/index.js` |

`tsconfig.json` の `rootDir` は `"."`。`src/` と `generated/` が相互参照するため両方を含む必要があり、
出力は `dist/src/` と `dist/generated/` になる。`main` と `start` はこの構造に合わせること。

`generated/swagger.json` は tsc がコピーしないため `postbuild` で明示的に配置している
（`src/app.ts` が `dist/generated/swagger.json` を `res.sendFile` する）。

## tsoa の依存構成

`tsoa`（CLI本体）は **devDependencies**、`@tsoa/runtime` が **dependencies**。

- アプリのコードは `@tsoa/runtime` から import する（`from 'tsoa'` は使わない）
- CLIはコード生成時（`npm run tsoa:generate`）にしか使わないため本番ツリーに載せない
- この分離により、`@tsoa/cli` が引く脆弱性（`@hapi/*`、`yaml`、`ts-deepmerge` など）が
  本番依存から外れる

## CI

GitHub Actions（`.github/workflows/ci.yml`）。`make` は `docker compose exec` を前提とするため、
CIでは npm スクリプトを直接呼ぶ。`generated/` はgit管理外なので `npm run tsoa:generate` を最初に実行する。
Nodeのバージョンは `.nvmrc` を単一の情報源とする（Dockerfileの `node:24-alpine` と揃える）。

## DI（依存性注入）

InversifyJSを使用。コンテナ設定は `src/infrastructure/di/container.ts`。

## API

tsoa + Expressで自動生成。Swagger UIは `/docs` で確認可能。
