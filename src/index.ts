import { createApp } from './app';
import { AppDataSource } from './infrastructure/database';

// eslint-disable-next-line max-lines-per-function -- エントリポイントは分割不要
async function bootstrap(): Promise<void> {
  // データベース接続
  await AppDataSource.initialize();
  console.log('データベースに接続しました');

  // アプリケーション作成
  const app = createApp();

  // サーバー起動
  const PORT = process.env.PORT ?? 3000;
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
