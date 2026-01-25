import { injectable, inject } from 'inversify';
import { CustomerNotFoundError } from '../../../domain/aggregates/customer/errors';
import { Order } from '../../../domain/aggregates/order';
import { IOrderRepository, ICustomerRepository } from '../../../domain/repositories';
import { CustomerId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { CreateOrderDto, OrderResponseDto, toOrderResponseDto } from '../../dtos';

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @inject(TYPES.ICustomerRepository)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const customerId = CustomerId.fromString(dto.customerId);

    // 顧客の存在確認
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomerNotFoundError(dto.customerId);
    }

    // 注文を作成
    const order = Order.create(customerId);

    // 顧客に配送先が設定されていれば、注文にも設定
    const shippingAddress = customer.getShippingAddress();
    if (shippingAddress) {
      order.setShippingAddress(shippingAddress);
    }

    await this.orderRepository.save(order);

    return toOrderResponseDto(order);
  }
}
