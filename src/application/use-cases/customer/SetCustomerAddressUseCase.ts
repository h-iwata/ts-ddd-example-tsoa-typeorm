import { inject, injectable } from 'inversify';
import { CustomerNotFoundError } from '../../../domain/aggregates/customer/errors';
import { type ICustomerRepository } from '../../../domain/repositories';
import { Address, CustomerId } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type CustomerResponseDto, type SetAddressDto, toCustomerResponseDto } from '../../dtos';

@injectable()
export class SetCustomerAddressUseCase {
  constructor(
    @inject(TYPES.ICustomerRepository)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(customerId: string, dto: SetAddressDto): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findById(CustomerId.fromString(customerId));
    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }
    customer.setShippingAddress(Address.create(dto.postalCode, dto.prefecture, dto.city, dto.street, dto.building));
    await this.customerRepository.save(customer);

    return toCustomerResponseDto(customer);
  }
}
