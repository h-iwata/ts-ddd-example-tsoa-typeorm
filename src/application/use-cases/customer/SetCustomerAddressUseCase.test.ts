import { SetCustomerAddressUseCase } from './SetCustomerAddressUseCase';
import { ICustomerRepository } from '../../../domain/repositories';
import { CustomerNotFoundError } from '../../../shared/errors';
import { customerFactory } from '../../../test/factories';

describe('SetCustomerAddressUseCase', () => {
  let useCase: SetCustomerAddressUseCase;
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

    useCase = new SetCustomerAddressUseCase(mockCustomerRepository);
  });

  it('顧客の住所を設定できる', async () => {
    const customer = customerFactory.build();
    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockCustomerRepository.save.mockResolvedValue();

    const result = await useCase.execute(customer.getId().getValue(), {
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '1-1-1',
    });

    expect(result.shippingAddress).toBeDefined();
    expect(result.shippingAddress?.postalCode).toBe('100-0001');
    expect(result.shippingAddress?.prefecture).toBe('東京都');
    expect(result.shippingAddress?.city).toBe('千代田区');
    expect(result.shippingAddress?.street).toBe('1-1-1');
    expect(mockCustomerRepository.save).toHaveBeenCalled();
  });

  it('建物名を含む住所を設定できる', async () => {
    const customer = customerFactory.build();
    mockCustomerRepository.findById.mockResolvedValue(customer);
    mockCustomerRepository.save.mockResolvedValue();

    const result = await useCase.execute(customer.getId().getValue(), {
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '1-1-1',
      building: 'テストビル101',
    });

    expect(result.shippingAddress?.building).toBe('テストビル101');
  });

  it('顧客が見つからない場合はエラー', async () => {
    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', {
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '1-1-1',
      })
    ).rejects.toThrow(CustomerNotFoundError);
  });
});
