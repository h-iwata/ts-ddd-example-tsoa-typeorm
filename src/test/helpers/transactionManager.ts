import { type ITransactionManager } from '../../domain/repositories';

/**
 * トランザクションを張らずにコールバックをそのまま実行するスタブ。
 * ユニットテストではDBを使わないため、境界の有無は検証対象にしない
 * （原子性は src/test/e2e のE2Eテストで検証している）。
 */
export function stubTransactionManager(): ITransactionManager {
  return { run: <T>(fn: () => Promise<T>): Promise<T> => fn() };
}
