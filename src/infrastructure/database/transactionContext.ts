import { AsyncLocalStorage } from 'node:async_hooks';
import { type EntityManager } from 'typeorm';
import { AppDataSource } from './dataSource';

/**
 * 実行中のトランザクションのEntityManagerを保持する。
 * リポジトリはこれを経由することで、呼び出し側がトランザクションを
 * 張っているかどうかを意識せずに済む。
 */
const storage = new AsyncLocalStorage<EntityManager>();

/**
 * トランザクション中ならそのEntityManagerを、そうでなければ既定のものを返す
 */
export function getEntityManager(): EntityManager {
  return storage.getStore() ?? AppDataSource.manager;
}

/**
 * コールバック内のリポジトリ操作を単一のトランザクションで実行する
 */
export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  return AppDataSource.transaction((manager) => storage.run(manager, fn));
}
