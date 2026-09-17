/**
 * ドメインエラーの分類
 *
 * 「見つからない」「競合した」といった意味はドメインの関心事なのでドメイン層が持ち、
 * presentation層はこの分類をHTTPステータスへ写すだけにする。
 */
export type DomainErrorKind = 'notFound' | 'conflict' | 'validation' | 'businessRule';

/**
 * ドメインエラーの基底クラス
 *
 * kind が abstract なので、具象エラーは下の4分類のいずれかを継承しなければ
 * コンパイルが通らない。これにより分類漏れが構造的に起きない。
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly kind: DomainErrorKind;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 対象が存在しない
 * 例: 指定IDの商品・注文・顧客が見つからない
 */
export abstract class NotFoundError extends DomainError {
  readonly kind = 'notFound';
}

/**
 * 現在の状態と競合していて受け付けられない
 * 例: メールアドレスの重複
 */
export abstract class ConflictError extends DomainError {
  readonly kind = 'conflict';
}

/**
 * 入力値そのものがドメインのルールを満たさない
 * 状態に関係なく、その値は常に不正である
 * 例: 負の価格、不正な形式のメールアドレス
 */
export abstract class ValidationError extends DomainError {
  readonly kind = 'validation';
}

/**
 * 値は正しいが、業務ルール上その操作が許されない
 * 同じ入力でも、状態が変われば成功しうる
 * 例: 在庫不足、配送先未設定での注文確定
 */
export abstract class BusinessRuleViolationError extends DomainError {
  readonly kind = 'businessRule';
}
