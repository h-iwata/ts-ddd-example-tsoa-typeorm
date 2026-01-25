import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { Customer } from '../../../domain/aggregates/customer';
import { Email } from '../../../domain/value-objects';
import { ICustomerRepository } from '../../../domain/repositories';
import {
  CreateCustomerDto,
  CustomerResponseDto,
  toCustomerResponseDto,
} from '../../dtos';

@injectable()
export class CreateCustomerUseCase {
  constructor(
    @inject(TYPES.ICustomerRepository)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const email = Email.create(dto.email);

    // メールアドレスの重複チェック
    const exists = await this.customerRepository.existsByEmail(email);
    if (exists) {
      throw new Error(`このメールアドレスは既に登録されています: ${dto.email}`);
    }

    const customer = Customer.create(dto.name, email);

    await this.customerRepository.save(customer);

    return toCustomerResponseDto(customer);
  }
}
