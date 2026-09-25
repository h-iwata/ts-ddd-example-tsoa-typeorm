import { inject, injectable } from 'inversify';
import { Order } from '../../../domain/aggregates/order';
import { type ICustomerRepository, type IOrderRepository } from '../../../domain/repositories';
import { CustomerId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type CreateOrderDto, type OrderResponseDto, toOrderResponseDto } from '../../dtos';

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
    const customer = await this.customerRepository.findByIdOrFail(customerId);
    const order = Order.create(customerId);

    // 注文時点の配送先を写し取る。以後に顧客側が変更されても、この注文の届け先は変わらない
    const shippingAddress = customer.getShippingAddress();
    if (shippingAddress) {
      order.setShippingAddress(shippingAddress);
    }
    await this.orderRepository.add(order);

    return toOrderResponseDto(order);
  }
}
