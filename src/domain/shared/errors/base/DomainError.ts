// 「見つからない」「競合した」という意味はドメインの関心事。HTTPステータスへの変換はpresentation層の仕事
export type DomainErrorKind = 'notFound' | 'conflict' | 'validation' | 'businessRule';

// kindをabstractにすることで、4分類のいずれかを継承しない具象エラーはコンパイルが通らない
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly kind: DomainErrorKind;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export abstract class NotFoundError extends DomainError {
  readonly kind = 'notFound';
}

// 既存データとぶつかって受け付けられない。例: メールアドレスの重複
export abstract class ConflictError extends DomainError {
  readonly kind = 'conflict';
}

// 状態に関係なく、その値が常に不正。例: 負の価格
export abstract class ValidationError extends DomainError {
  readonly kind = 'validation';
}

// 値は正しく、状態が変われば成功しうる。例: 在庫不足
export abstract class BusinessRuleViolationError extends DomainError {
  readonly kind = 'businessRule';
}
