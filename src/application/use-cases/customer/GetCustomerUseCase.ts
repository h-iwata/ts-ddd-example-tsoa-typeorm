import { inject, injectable } from 'inversify';
import { CustomerNotFoundError } from '../../../domain/aggregates/customer/errors';
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
    const id = CustomerId.fromString(customerId);
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    return toCustomerResponseDto(customer);
  }
}
