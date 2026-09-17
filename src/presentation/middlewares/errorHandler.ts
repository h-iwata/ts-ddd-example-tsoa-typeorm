import { randomUUID } from 'node:crypto';
import { ValidateError } from '@tsoa/runtime';
import { type NextFunction, type Request, type Response } from 'express';
import { DomainError, type DomainErrorKind } from '../../domain/shared/errors';
import { logger, serializeError } from '../../infrastructure/logging';

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ValidateError) {
    res.status(400).json({
      message: 'バリデーションエラー',
      code: 'VALIDATION_ERROR',
      details: error.fields,
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(toStatusCode(error)).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  handleUnexpectedError(error, req, res);
}

// ここに来るのはドメインが想定していない事態＝バグかインフラ障害
function handleUnexpectedError(error: unknown, req: Request, res: Response): void {
  const incidentId = randomUUID();

  logger.error(
    {
      incidentId,
      method: req.method,
      path: req.path,
      err: serializeError(error),
    },
    '予期しないエラー'
  );

  // 内部構造を晒さずに調査できるよう、本文にはincidentIdだけを載せてログと突き合わせる
  res.status(500).json({
    message: 'サーバー内部エラーが発生しました',
    code: 'INTERNAL_ERROR',
    incidentId,
  });
}

// 分類が増えたらRecordの網羅性チェックでコンパイルエラーになる
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
