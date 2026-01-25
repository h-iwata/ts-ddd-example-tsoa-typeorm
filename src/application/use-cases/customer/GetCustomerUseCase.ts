import { injectable, inject } from 'inversify';
import { ICustomerRepository } from '../../../domain/repositories';
import { CustomerId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { CustomerNotFoundError } from '../../../shared/errors';
import { CustomerResponseDto, toCustomerResponseDto } from '../../dtos';

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
