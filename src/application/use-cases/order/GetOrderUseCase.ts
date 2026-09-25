import { inject, injectable } from 'inversify';
import { type IOrderRepository } from '../../../domain/repositories';
import { OrderId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type OrderResponseDto, toOrderResponseDto } from '../../dtos';

@injectable()
export class GetOrderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository)
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByIdOrFail(OrderId.fromString(orderId));

    return toOrderResponseDto(order);
  }
}
