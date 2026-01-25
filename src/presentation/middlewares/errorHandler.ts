import { type Request, type Response, type NextFunction } from 'express';
import { ValidateError } from 'tsoa';
import { DomainError } from '../../shared/errors';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(error); return;
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
    const statusCode = getStatusCodeForDomainError(error.code);
    res.status(statusCode).json({
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

function getStatusCodeForDomainError(code: string): number {
  const statusMap: Record<string, number> = {
    ORDER_NOT_FOUND: 404,
    PRODUCT_NOT_FOUND: 404,
    CUSTOMER_NOT_FOUND: 404,
    EMAIL_ALREADY_EXISTS: 409,
    INSUFFICIENT_STOCK: 400,
    INVALID_ORDER_STATE: 400,
    EMPTY_ORDER: 400,
    INVALID_PRICE: 400,
    INVALID_EMAIL: 400,
    INVALID_QUANTITY: 400,
  };

  return statusMap[code] ?? 500;
}
