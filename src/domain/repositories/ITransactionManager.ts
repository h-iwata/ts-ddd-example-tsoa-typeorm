/**
 * トランザクション境界を表すポート
 * 複数の集約をまたぐ更新を原子的に行うために使用する
 */
export interface ITransactionManager {
  run<T>(fn: () => Promise<T>): Promise<T>;
}
