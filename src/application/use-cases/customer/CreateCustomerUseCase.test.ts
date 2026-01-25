import { type ICustomerRepository } from '../../../domain/repositories';
import { CreateCustomerUseCase } from './CreateCustomerUseCase';

describe('CreateCustomerUseCase', () => {
  const mockRepo = (): jest.Mocked<ICustomerRepository> => ({
    findById: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  it('顧客を作成する', async () => {
    const repo = mockRepo();
    repo.existsByEmail.mockResolvedValue(false);
    const useCase = new CreateCustomerUseCase(repo);

    const result = await useCase.execute({ name: 'テスト太郎', email: 'test@example.com' });

    expect(result.name).toBe('テスト太郎');
    expect(result.email).toBe('test@example.com');
    expect(repo.save).toHaveBeenCalled();
  });

  context('when メール重複', () => {
    it('エラーを投げる', async () => {
      const repo = mockRepo();
      repo.existsByEmail.mockResolvedValue(true);
      const useCase = new CreateCustomerUseCase(repo);

      await expect(useCase.execute({ name: 'テスト', email: 'dup@example.com' }))
        .rejects.toThrow('既に登録されています');
    });
  });

  context('when 無効なメール', () => {
    it('エラーを投げる', async () => {
      const useCase = new CreateCustomerUseCase(mockRepo());
      await expect(useCase.execute({ name: 'テスト', email: 'invalid' })).rejects.toThrow();
    });
  });
});
