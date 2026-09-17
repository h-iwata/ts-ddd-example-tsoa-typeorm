import { Product } from '../../domain/aggregates/product';
import { Money, Quantity } from '../../domain/shared/value-objects';
import { ProductRepository } from '../repositories';
import { AppDataSource } from './dataSource';
import { runInTransaction } from './transactionContext';

describe('runInTransaction Integration', () => {
  const repository = new ProductRepository();
  const build = (name: string) => Product.create(name, '', Money.create(100), Quantity.create(1));
  const savedNames = async (): Promise<string[]> => {
    const rows: { name: string }[] = await AppDataSource.query('SELECT name FROM products ORDER BY name');
    return rows.map((row) => row.name);
  };

  context('ネストして呼ばれたとき', () => {
    // 内側で新しくトランザクションを張ると別コネクションになり、外側のロールバックから外れてしまう
    it('内側は外側のトランザクションに参加し、外側の失敗で一緒に巻き戻る', async () => {
      await expect(
        runInTransaction(async () => {
          await repository.add(build('外側'));
          await runInTransaction(async () => {
            await repository.add(build('内側'));
          });
          throw new Error('外側を失敗させる');
        })
      ).rejects.toThrow('外側を失敗させる');

      expect(await savedNames()).toEqual([]);
    });

    it('外側が成功すれば両方コミットされる', async () => {
      await runInTransaction(async () => {
        await repository.add(build('外側'));
        await runInTransaction(async () => {
          await repository.add(build('内側'));
        });
      });

      expect(await savedNames()).toEqual(['内側', '外側']);
    });
  });

  context('トランザクションの外で呼ばれたとき', () => {
    it('自分でトランザクションを張り、失敗すれば巻き戻る', async () => {
      await expect(
        runInTransaction(async () => {
          await repository.add(build('単独'));
          throw new Error('失敗');
        })
      ).rejects.toThrow('失敗');

      expect(await savedNames()).toEqual([]);
    });
  });
});
