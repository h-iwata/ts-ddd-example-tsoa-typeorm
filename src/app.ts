import 'reflect-metadata';
import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './generated/routes';
import { setupContainer } from './infrastructure/di';
import { errorHandler } from './presentation/middlewares';

/**
 * Expressアプリケーションを作成
 */
// eslint-disable-next-line max-lines-per-function -- アプリ初期化は分割不要
export function createApp(): Express {
  // DIコンテナの設定
  setupContainer();

  const app = express();

  // ミドルウェア
  app.use(express.json());

  // Swagger UI
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/swagger.json',
      },
    })
  );

  // OpenAPI仕様を提供
  app.get('/swagger.json', (_req, res) => {
    res.sendFile(`${__dirname}/generated/swagger.json`);
  });

  // tsoaが生成したルートを登録
  RegisterRoutes(app);

  // エラーハンドリング
  app.use(errorHandler);

  return app;
}
