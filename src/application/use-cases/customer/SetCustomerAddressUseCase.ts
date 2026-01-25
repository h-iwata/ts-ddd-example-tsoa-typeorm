import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { CustomerId, Address } from '../../../domain/value-objects';
import { ICustomerRepository } from '../../../domain/repositories';
import {
  SetAddressDto,
  CustomerResponseDto,
  toCustomerResponseDto,
} from '../../dtos';
import { CustomerNotFoundError } from '../../../shared/errors';

@injectable()
export class SetCustomerAddressUseCase {
  constructor(
    @inject(TYPES.ICustomerRepository)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(
    customerId: string,
    dto: SetAddressDto
  ): Promise<CustomerResponseDto> {
    const id = CustomerId.fromString(customerId);
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    const address = Address.create(
      dto.postalCode,
      dto.prefecture,
      dto.city,
      dto.street,
      dto.building
    );

    customer.setShippingAddress(address);

    await this.customerRepository.save(customer);

    return toCustomerResponseDto(customer);
  }
}
