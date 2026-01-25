import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './generated/routes';
import { setupContainer } from './infrastructure/di';
import { errorHandler } from './presentation/middlewares';
import { AppDataSource } from './infrastructure/database';

async function bootstrap(): Promise<void> {
  // MySQL使用時はDataSourceを初期化
  if (process.env.USE_MYSQL === 'true') {
    await AppDataSource.initialize();
    console.log('データベースに接続しました');
  }

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
    res.sendFile(__dirname + '/generated/swagger.json');
  });

  // tsoaが生成したルートを登録
  RegisterRoutes(app);

  // エラーハンドリング
  app.use(errorHandler);

  // サーバー起動
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║         DDD Example API Server                        ║
╠═══════════════════════════════════════════════════════╣
║  Server:  http://localhost:${PORT}                       ║
║  Swagger: http://localhost:${PORT}/docs                  ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

bootstrap().catch(console.error);
