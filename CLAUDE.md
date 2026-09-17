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

### コメント

**コメントは失敗の表明**（Clean Code 第4章）。まずコードで語り、それでも伝わらないものだけをコメントにする。
書きたくなったら、その前に「関数に切り出して名前を付けられないか」「変数名で表現できないか」を考える。
悪いコードをコメントで補わない ── 直すべきはコードのほう。

#### 残してよいコメント

| 種類 | 例 |
|---|---|
| **意図の説明**（なぜそうしたか） | `// existsByEmail の確認と保存の間に、別のリクエストが同じメールを登録した場合に起きる` |
| **情報**（コードから導けない外部仕様） | `// sqlMessage の形式: Duplicate entry '<値>' for key '<テーブル>.<インデックス名>'` |
| **結果の警告**（変えると壊れるもの） | `// 注文は作成時に顧客の配送先を引き継ぐため、注文を作る前に顧客側へ設定する` |
| **強調**（自明に見えて重要な処理） | `// 書き込みの前に注文側のルールを検証する` |
| **TODO** | `// TODO: 〜`（放置しない。残す理由を書く） |
| **生成物の入力**（後述） | tsoaコントローラーのJSDoc、`biome-ignore` |

テストでは、テスト名に収まらない**前提条件や、そのテストが何を守っているか**を書いてよい。

#### 書いてはいけないコメント

- **冗長** ── 名前の言い換え。`/** 注文をキャンセル */ cancel()`、`/** 金額を表す値オブジェクト */ class Money`
- **バナー・位置マーカー** ── `// ========== Getters ==========`、`// Repositories`
  （区切りが欲しくなるのはクラス/ファイルが大きすぎるサイン。空行で足りる）
- **手順のラベル** ── 直後の1行を言い換えるだけのもの。`// 顧客の存在確認` → `findById(...)`
  （順序に意味があるなら関数へ切り出す）
- **コメントアウトされたコード** ── 消す。gitが覚えている
- **変更履歴・署名** ── `// 2026-01-01 追加 by ◯◯`。git blameで足りる
- **閉じ括弧コメント** ── `} // end of for`
- **規則で強制されたJSDoc** ── 「全publicメソッドにJSDoc」のような機械的な付与
- **対象を失ったコメント** ── import整列やリファクタで指す先がなくなったもの。最も有害

#### JSDocを書く場所（このプロジェクト固有）

**tsoaが読むJSDocは削除しない。** OpenAPI仕様の生成元であり、Swagger UIに表示される。
対象はコントローラーのメソッドだけでなく、**そこから参照される型（DTO・レスポンス型）も含む**。

```typescript
// コントローラー
/**
 * 商品を取得              ← swagger.json の description になる
 * @param productId 商品ID  ← パラメータの description になる
 */
@Get('{productId}')
async getProduct(@Path() productId: string): Promise<ProductResponseDto> {

// 参照される型
/**
 * APIエラーレスポンスの共通型   ← schemas の description になる
 */
export interface ErrorResponse {
```

一見すると「名前の言い換え」に見えても、これらは**生成物の入力なので消してはいけない**。
判断に迷ったら `npm run tsoa:generate` を実行し、`generated/swagger.json` に差分が出ないか確認する。

上記以外でJSDoc形式（`/** */`）を使うのは、「残してよいコメント」に該当する場合のみ。
説明的な要約JSDocは付けない。

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

例外は「判断できない場所」で投げ、「判断できる場所」で1回だけ捕まえる。
domain が投げ、application は素通しし、presentation の `errorHandler` だけが捕まえる。
**use-case に `try/catch` は書かない**（握りつぶすと型情報が失われ、4xxが5xxになる）。

#### ドメインエラーの分類

すべての具象エラーは `src/domain/shared/errors/base/` の4分類のいずれかを継承する。
`DomainError.kind` が `abstract` なので、分類しないとコンパイルが通らない。

| 分類 | 意味 | HTTPステータス |
|---|---|---|
| `NotFoundError` | 対象が存在しない | 404 |
| `ConflictError` | 現在の状態と競合する | 409 |
| `ValidationError` | 入力値が常に不正 | 400 |
| `BusinessRuleViolationError` | 値は正しいが業務ルール上できない | 400 |

```typescript
import { BusinessRuleViolationError } from '../../../shared/errors';

export class OrderAlreadyShippedError extends BusinessRuleViolationError {
  readonly code = 'ORDER_ALREADY_SHIPPED';
  constructor() {
    super('発送済みの注文は変更できません');
  }
}
```

ステータスの対応は `errorHandler.ts` の `STATUS_BY_KIND` に集約されている。
エラーを追加しても `errorHandler.ts` は変更しない。

#### 想定内と想定外の切り分け

`DomainError`（4xx）は**業務ルール上の正しい拒否**なのでログを出さずアラートも鳴らさない。
それ以外（5xx）は**バグかインフラ障害**なので、`incidentId` を採番して構造化ログに記録する。
この2つを混ぜると「在庫不足」で夜中にアラートが鳴り、誰もアラートを見なくなる。

| | `DomainError` | それ以外 |
|---|---|---|
| ステータス | 4xx | 500 |
| ログ | 出さない | `logger.error` |
| レスポンス本文 | `message` をそのまま返す | 内部情報は伏せ、`incidentId` のみ返す |

```json
{ "message": "サーバー内部エラーが発生しました", "code": "INTERNAL_ERROR", "incidentId": "018f..." }
```

同じ `incidentId` がログにも出るため、問い合わせを受けたら `incidentId` で検索して該当リクエストを特定できる。

#### ログ

`src/infrastructure/logging/logger.ts` が**アプリ唯一のconsole出力口**。他の場所で `console.*` を使わない
（`src/index.ts` の起動バナーと migrations を除く）。1行1JSONで出力する。

```typescript
logger.error({ incidentId, method, path, err: serializeError(error) }, '予期しないエラー');
```

`Error` は列挙可能なプロパティを持たず `JSON.stringify` すると `{}` になるため、必ず `serializeError()` を通す。
引数の順序は pino に合わせてあるので、将来 pino を導入するときは logger.ts の実装だけを差し替えればよい。

#### 置き場所

- 集約固有: `src/domain/aggregates/<集約>/errors/`
- 集約に属さない共有の値オブジェクト由来: `src/domain/shared/errors/` 直下
- `src/domain/shared/errors/base/` は分類の定義のみ。触らない

#### @Response の宣言方針

TypeScriptには検査例外が無いため、「実際に投げうるエラー」と「`@Response` の宣言」を結ぶ仕組みが無い。
放置すると宣言は静かに実態からずれるので、**ズレを検出する側**で担保する。

- **全メソッドで起こりうるものはクラスに1回だけ宣言する**（`@Response` は `ClassDecorator` でもある）
  - `500` は全エンドポイント
  - `400` は入力を受け取る全エンドポイント（入力が無い一覧APIなどは対象外）
- **そのエンドポイント固有の意味を持つものだけメソッドに書く**（`404`、`409` など）
- **どのエラーかの区別はレスポンス本文の `code` で表す**。ステータスごとに説明を細分化しない
  （個別の事情はメソッドのJSDocに書く。JSDocはOpenAPIのdescriptionになる）

```typescript
@Response<ErrorResponse>(400, 'Validation error (詳細は code を参照)')
@Response<ErrorResponse>(500, 'Internal server error')
@Route('api/customers')
export class CustomerController extends Controller {

  @Post('/')
  @Response<ErrorResponse>(409, 'Email already exists')   // ← ここ固有のものだけ
```

`src/test/e2e/specCoverage.ts` がE2E中の全レスポンスを観測し、
未宣言のものがあればE2Eの最後のテストが落ちる。宣言を増やす前にまずテストを書けばよい。

#### インフラ例外の翻訳

TypeORMの例外をそのまま上げない。リポジトリでドメインエラーへ翻訳し、
翻訳できないものは `throw error` で素通しする（ここが `try/catch` を書いてよい唯一の場所）。

```typescript
try {
  await this.repository.save(entity);
} catch (error) {
  if (isUniqueViolation(error, UQ_CUSTOMERS_EMAIL)) {
    throw new EmailAlreadyExistsError(customer.getEmail().getValue());
  }
  throw error;
}
```

MySQL固有の判定は `src/infrastructure/database/mysqlErrors.ts` に閉じ込める。
一意制約名は `@Index('UQ_<テーブル>_<カラム>', { unique: true })` で明示的に命名する
（TypeORMの自動生成名はスキーマ変更で変わるため、コードから参照してはいけない）。

なお、use-case 側の事前チェック（`existsByEmail` 等）は削除しない。
事前チェックは分かりやすいエラーのため、DB制約は正しさの担保のためで、役割が異なる。

## テスト

- ユニットテスト: `*.test.ts`
- 統合テスト・E2Eテスト: `*.integration.test.ts`（DBが必要。E2Eは `src/test/e2e/`）
- テストファクトリ: `src/test/factories/`（fishery使用）
- RSpecスタイルの`context`ヘルパー: `src/test/setup.ts` / `src/test/integration/setup.ts` で `global.context` を定義

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
