import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { CustomerId } from '../../../domain/value-objects';
import { ICustomerRepository } from '../../../domain/repositories';
import { CustomerResponseDto, toCustomerResponseDto } from '../../dtos';
import { CustomerNotFoundError } from '../../../shared/errors';

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
