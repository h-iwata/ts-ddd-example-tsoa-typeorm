import { inject, injectable } from 'inversify';
import { type ICustomerRepository } from '../../../domain/repositories';
import { CustomerId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type CustomerResponseDto, toCustomerResponseDto } from '../../dtos';

@injectable()
export class GetCustomerUseCase {
  constructor(
    @inject(TYPES.ICustomerRepository)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(customerId: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findByIdOrFail(CustomerId.fromString(customerId));

    return toCustomerResponseDto(customer);
  }
}
