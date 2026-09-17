import { ValidateError } from '@tsoa/runtime';
import { type NextFunction, type Request, type Response } from 'express';
import { DomainError, type DomainErrorKind } from '../../domain/shared/errors';

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  // tsoa バリデーションエラー
  if (error instanceof ValidateError) {
    res.status(400).json({
      message: 'バリデーションエラー',
      code: 'VALIDATION_ERROR',
      details: error.fields,
    });
    return;
  }

  // ドメインエラー
  if (error instanceof DomainError) {
    res.status(toStatusCode(error)).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  // その他のエラー
  if (error instanceof Error) {
    console.error('予期しないエラー:', error);
    res.status(500).json({
      message: 'サーバー内部エラーが発生しました',
      code: 'INTERNAL_ERROR',
    });
    return;
  }

  next(error);
}

/**
 * ドメインエラーの分類をHTTPステータスへ写す
 *
 * 個々のエラーではなく分類だけを見るため、新しいエラーを追加しても
 * この対応表を更新する必要はない。分類そのものが増えた場合は
 * Record の網羅性チェックによりコンパイルエラーになる。
 */
const STATUS_BY_KIND: Record<DomainErrorKind, number> = {
  notFound: 404,
  conflict: 409,
  validation: 400,
  // 業務ルール違反は422も選択肢だが、既存のAPI契約に合わせて400を返す
  businessRule: 400,
};

function toStatusCode(error: DomainError): number {
  return STATUS_BY_KIND[error.kind];
}
