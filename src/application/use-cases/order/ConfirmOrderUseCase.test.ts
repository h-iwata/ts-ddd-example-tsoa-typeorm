import { ConfirmOrderUseCase } from './ConfirmOrderUseCase';
import { IOrderRepository } from '../../../domain/repositories';
import { OrderDomainService } from '../../../domain/services';
import { OrderNotFoundError } from '../../../shared/errors';
import { orderFactory } from '../../../test/factories';

describe('ConfirmOrderUseCase', () => {
  let useCase: ConfirmOrderUseCase;
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

    useCase = new ConfirmOrderUseCase(mockOrderRepository, mockOrderDomainService);
  });

  it('注文を確定できる', async () => {
    const order = orderFactory.build({}, { transient: { withItems: true, withAddress: true } });
    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderDomainService.validateAndReserveStock.mockResolvedValue();
    mockOrderRepository.save.mockResolvedValue();

    const result = await useCase.execute(order.getId().getValue());

    expect(result.status).toBe('CONFIRMED');
    expect(mockOrderDomainService.validateAndReserveStock).toHaveBeenCalledWith(order);
    expect(mockOrderRepository.save).toHaveBeenCalled();
  });

  it('注文が見つからない場合はエラー', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      OrderNotFoundError
    );
  });

  it('在庫引き当てに失敗した場合はエラー', async () => {
    const order = orderFactory.build({}, { transient: { withItems: true, withAddress: true } });
    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderDomainService.validateAndReserveStock.mockRejectedValue(
      new Error('在庫不足')
    );

    await expect(useCase.execute(order.getId().getValue())).rejects.toThrow('在庫不足');
  });
});
