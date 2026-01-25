import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../../domain/repositories';
import { CustomerId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { OrderResponseDto, toOrderResponseDto } from '../../dtos';

@injectable()
export class GetCustomerOrdersUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(customerId: string): Promise<OrderResponseDto[]> {
    const id = CustomerId.fromString(customerId);
    const orders = await this.orderRepository.findByCustomerId(id);
    return orders.map(toOrderResponseDto);
  }
}
