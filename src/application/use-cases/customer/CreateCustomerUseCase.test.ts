import { CreateCustomerUseCase } from './CreateCustomerUseCase';
import { ICustomerRepository } from '../../../domain/repositories';
import { Customer } from '../../../domain/aggregates/customer';
import { Email } from '../../../domain/value-objects';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>;

  beforeEach(() => {
    mockCustomerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateCustomerUseCase(mockCustomerRepository);
  });

  it('顧客を作成できる', async () => {
    mockCustomerRepository.existsByEmail.mockResolvedValue(false);
    mockCustomerRepository.save.mockResolvedValue();

    const result = await useCase.execute({
      name: 'テスト太郎',
      email: 'test@example.com',
    });

    expect(result.name).toBe('テスト太郎');
    expect(result.email).toBe('test@example.com');
    expect(result.id).toBeDefined();
    expect(mockCustomerRepository.save).toHaveBeenCalled();
  });

  it('メールアドレスが既に登録されている場合はエラー', async () => {
    mockCustomerRepository.existsByEmail.mockResolvedValue(true);

    await expect(
      useCase.execute({
        name: 'テスト太郎',
        email: 'existing@example.com',
      })
    ).rejects.toThrow('このメールアドレスは既に登録されています: existing@example.com');
  });

  it('無効なメールアドレスの場合はエラー', async () => {
    await expect(
      useCase.execute({
        name: 'テスト太郎',
        email: 'invalid-email',
      })
    ).rejects.toThrow();
  });
});
