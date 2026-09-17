import { inject, injectable } from 'inversify';
import { Customer } from '../../../domain/aggregates/customer';
import { EmailAlreadyExistsError } from '../../../domain/aggregates/customer/errors';
import { type ICustomerRepository } from '../../../domain/repositories';
import { Email } from '../../../domain/value-objects';
import { TYPES } from '../../../infrastructure/di/types';
import { type CreateCustomerDto, type CustomerResponseDto, toCustomerResponseDto } from '../../dtos';

@injectable()
export class CreateCustomerUseCase {
  constructor(
    @inject(TYPES.ICustomerRepository)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const email = Email.create(dto.email);

    const exists = await this.customerRepository.existsByEmail(email);
    if (exists) {
      throw new EmailAlreadyExistsError(dto.email);
    }

    const customer = Customer.create(dto.name, email);

    await this.customerRepository.save(customer);

    return toCustomerResponseDto(customer);
  }
}
