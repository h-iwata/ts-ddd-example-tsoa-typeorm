import { inject, injectable } from 'inversify';
import { type IOrderRepository } from '../../../domain/repositories';
import { CustomerId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type OrderResponseDto, toOrderResponseDto } from '../../dtos';

@injectable()
export class GetCustomerOrdersUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(customerId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByCustomerId(CustomerId.fromString(customerId));
    return orders.map(toOrderResponseDto);
  }
}
