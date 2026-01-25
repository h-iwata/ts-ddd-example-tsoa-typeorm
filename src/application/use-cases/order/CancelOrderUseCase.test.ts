import { CancelOrderUseCase } from './CancelOrderUseCase';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderDomainService } from '../../../domain/services';
import { OrderNotFoundError } from '../../../shared/errors';
import { orderFactory, confirmedOrderFactory, paidOrderFactory } from '../../../test/factories';

describe('CancelOrderUseCase', () => {
  let useCase: CancelOrderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockOrderDomainService: jest.Mocked<OrderDomainService>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockOrderDomainService = {
      validateAndReserveStock: jest.fn(),
      releaseStock: jest.fn(),
      checkStockAvailability: jest.fn(),
    } as unknown as jest.Mocked<OrderDomainService>;

    useCase = new CancelOrderUseCase(mockOrderRepository, mockOrderDomainService);
  });

  it('PENDING状態の注文をキャンセルできる', async () => {
    const order = orderFactory.build();
    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderRepository.save.mockResolvedValue();

    const result = await useCase.execute(order.getId().getValue());

    expect(result.status).toBe('CANCELLED');
    expect(mockOrderDomainService.releaseStock).not.toHaveBeenCalled();
    expect(mockOrderRepository.save).toHaveBeenCalled();
  });

  it('CONFIRMED状態の注文をキャンセルすると在庫が戻る', async () => {
    const order = confirmedOrderFactory.build();
    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderDomainService.releaseStock.mockResolvedValue();
    mockOrderRepository.save.mockResolvedValue();

    const result = await useCase.execute(order.getId().getValue());

    expect(result.status).toBe('CANCELLED');
    expect(mockOrderDomainService.releaseStock).toHaveBeenCalledWith(order);
    expect(mockOrderRepository.save).toHaveBeenCalled();
  });

  it('PAID状態の注文をキャンセルすると在庫が戻る', async () => {
    const order = paidOrderFactory.build();
    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderDomainService.releaseStock.mockResolvedValue();
    mockOrderRepository.save.mockResolvedValue();

    const result = await useCase.execute(order.getId().getValue());

    expect(result.status).toBe('CANCELLED');
    expect(mockOrderDomainService.releaseStock).toHaveBeenCalledWith(order);
  });

  it('注文が見つからない場合はエラー', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      OrderNotFoundError
    );
  });
});
