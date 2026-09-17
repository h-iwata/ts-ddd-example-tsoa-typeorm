import { AsyncLocalStorage } from 'node:async_hooks';
import { type EntityManager } from 'typeorm';
import { AppDataSource } from './dataSource';

// リポジトリが呼び出し側のトランザクションの有無を意識せずに済むよう、非同期文脈で伝播させる
const storage = new AsyncLocalStorage<EntityManager>();

export function getEntityManager(): EntityManager {
  return storage.getStore() ?? AppDataSource.manager;
}

export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  // 既にトランザクション中に新しく張ると別コネクションの独立したトランザクションになり、
  // 外側がロールバックしても内側だけコミットされてしまうため、外側があれば参加する
  if (storage.getStore()) {
    return fn();
  }
  return AppDataSource.transaction((manager) => storage.run(manager, fn));
}
