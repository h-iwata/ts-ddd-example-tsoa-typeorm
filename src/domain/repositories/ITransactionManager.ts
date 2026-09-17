// 複数の集約をまたぐ更新を原子的に行うためのポート。実装はinfrastructure層
export interface ITransactionManager {
  run<T>(fn: () => Promise<T>): Promise<T>;
}
