import { type ITransactionManager } from '../../domain/repositories';

// ユニットテストではDBを使わないためトランザクション境界は検証しない（原子性は src/test/e2e で検証）
export function stubTransactionManager(): ITransactionManager {
  return { run: <T>(fn: () => Promise<T>): Promise<T> => fn() };
}
