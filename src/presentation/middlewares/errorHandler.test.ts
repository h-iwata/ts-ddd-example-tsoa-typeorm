import { ValidateError } from '@tsoa/runtime';
import { type NextFunction, type Request, type Response } from 'express';
import { EmailAlreadyExistsError } from '../../domain/aggregates/customer/errors';
import { InsufficientStockError } from '../../domain/aggregates/order/errors';
import { ProductNotFoundError } from '../../domain/aggregates/product/errors';
import { InvalidPriceError } from '../../domain/shared/errors';
import { errorHandler } from './errorHandler';

interface Captured {
  status: number;
  body: Record<string, unknown>;
}

function run(error: unknown, headersSent = false) {
  const captured: Partial<Captured> = {};
  const res = {
    headersSent,
    status(code: number) {
      captured.status = code;
      return this;
    },
    json(body: Record<string, unknown>) {
      captured.body = body;
      return this;
    },
  } as unknown as Response;

  const next = jest.fn() as unknown as NextFunction;
  const req = { method: 'POST', path: '/api/orders' } as Request;

  errorHandler(error, req, res, next);

  return { captured: captured as Captured, next: next as unknown as jest.Mock };
}

describe('errorHandler', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  const loggedRecord = () => JSON.parse(String(consoleError.mock.calls[0][0])) as Record<string, unknown>;

  describe('ドメインエラー', () => {
    it.each([
      ['NotFoundError', new ProductNotFoundError('p-1'), 404],
      ['ConflictError', new EmailAlreadyExistsError('a@example.com'), 409],
      ['ValidationError', new InvalidPriceError(-1), 400],
      ['BusinessRuleViolationError', new InsufficientStockError('p-1', 5, 1), 400],
    ])('%s は分類に応じたステータスを返す', (_name, error, status) => {
      const { captured } = run(error);

      expect(captured.status).toBe(status);
      expect(captured.body.code).toBe(error.code);
    });

    it('incidentIdを付けず、ログにも出さない', () => {
      const { captured } = run(new ProductNotFoundError('p-1'));

      expect(captured.body.incidentId).toBeUndefined();
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('tsoaのバリデーションエラー', () => {
    it('400を返す', () => {
      const { captured } = run(new ValidateError({ name: { message: 'required' } }, ''));

      expect(captured.status).toBe(400);
      expect(captured.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('想定外のエラー', () => {
    it('500とincidentIdを返す', () => {
      const { captured } = run(new Error('DB接続失敗'));

      expect(captured.status).toBe(500);
      expect(captured.body.code).toBe('INTERNAL_ERROR');
      expect(captured.body.incidentId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('内部のエラーメッセージを本文に漏らさない', () => {
      const { captured } = run(new Error('DB接続失敗: user=root password=secret'));

      expect(JSON.stringify(captured.body)).not.toContain('secret');
    });

    it('本文と同じincidentIdをリクエスト情報とともにログへ出す', () => {
      const { captured } = run(new Error('DB接続失敗'));
      const record = loggedRecord();

      expect(record.incidentId).toBe(captured.body.incidentId);
      expect(record.method).toBe('POST');
      expect(record.path).toBe('/api/orders');
      expect(record.err).toMatchObject({ name: 'Error', message: 'DB接続失敗' });
    });

    context('Errorでない値がthrowされたとき', () => {
      it('500として扱う', () => {
        const { captured } = run('文字列がthrowされた');

        expect(captured.status).toBe(500);
        expect(loggedRecord().err).toMatchObject({ name: 'UnknownError', message: '文字列がthrowされた' });
      });
    });
  });

  describe('レスポンス送信済みのとき', () => {
    it('二重送信せず後続のハンドラーへ委ねる', () => {
      const error = new Error('遅れて発生');
      const { captured, next } = run(error, true);

      expect(captured.status).toBeUndefined();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
