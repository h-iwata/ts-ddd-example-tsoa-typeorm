import { container } from './container';

/**
 * tsoaのIoCコンテナアダプター
 * tsoaがコントローラーをインスタンス化する際に使用される
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const iocContainer = {
  get<T>(controller: new (...args: any[]) => T): T {
    return container.get<T>(controller);
  },
};
