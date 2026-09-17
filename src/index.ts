import { createApp } from './app';
import { AppDataSource } from './infrastructure/database';
import { logger, serializeError } from './infrastructure/logging';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log('データベースに接続しました');

  const app = createApp();

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
  logger.error({ err: serializeError(error) }, 'サーバーの起動に失敗しました');
  process.exit(1);
});
