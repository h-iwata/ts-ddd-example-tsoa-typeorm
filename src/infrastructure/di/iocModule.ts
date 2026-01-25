import { container } from './container';

/**
 * tsoaのIoCコンテナアダプター
 * tsoaがコントローラーをインスタンス化する際に使用される
 */

export const iocContainer = {
  get<T>(controller: new (...args: unknown[]) => T): T {
    return container.get<T>(controller);
  },
};
