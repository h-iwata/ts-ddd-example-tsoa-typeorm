import { createApp } from './app';
import { AppDataSource } from './infrastructure/database';

async function bootstrap(): Promise<void> {
  // データベース接続
  await AppDataSource.initialize();
  console.log('データベースに接続しました');

  // アプリケーション作成
  const app = createApp();

  // サーバー起動
  const PORT = process.env.PORT ?? 3007;
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

bootstrap().catch((error: unknown) => {
  console.error('サーバーの起動に失敗しました:', error);
  process.exit(1);
});
