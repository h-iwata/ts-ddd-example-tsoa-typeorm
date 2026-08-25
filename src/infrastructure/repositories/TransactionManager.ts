import { injectable } from 'inversify';
import { type ITransactionManager } from '../../domain/repositories';
import { runInTransaction } from '../database/transactionContext';

@injectable()
export class TransactionManager implements ITransactionManager {
  async run<T>(fn: () => Promise<T>): Promise<T> {
    return runInTransaction(fn);
  }
}
