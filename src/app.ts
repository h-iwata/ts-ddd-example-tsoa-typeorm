import 'reflect-metadata';
import path from 'node:path';
import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from '../generated/routes';
import { setupContainer } from './infrastructure/di';
import { errorHandler } from './presentation/middlewares';

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: アプリ初期化は分割不要
export function createApp(): Express {
  setupContainer();

  const app = express();

  app.use(express.json());

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/swagger.json',
      },
    })
  );

  app.get('/swagger.json', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'generated', 'swagger.json'));
  });

  RegisterRoutes(app);

  app.use(errorHandler);

  return app;
}
