import { injectable } from 'inversify';
import { type Repository } from 'typeorm';
import { Customer, CustomerId, Email } from '../../domain/aggregates/customer';
import { EmailAlreadyExistsError } from '../../domain/aggregates/customer/errors';
import { type ICustomerRepository } from '../../domain/repositories';
import { Address } from '../../domain/shared/value-objects';
import { CustomerEntity, UQ_CUSTOMERS_EMAIL } from '../database/entities';
import { isUniqueViolation } from '../database/mysqlErrors';
import { getEntityManager } from '../database/transactionContext';

@injectable()
export class CustomerRepository implements ICustomerRepository {
  private get repository(): Repository<CustomerEntity> {
    return getEntityManager().getRepository(CustomerEntity);
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { id: id.getValue() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { email: email.getValue() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Customer[]> {
    const entities = await this.repository.find();
    return entities.map((e) => this.toDomain(e));
  }

  async save(customer: Customer): Promise<void> {
    const entity = this.toEntity(customer);
    try {
      await this.repository.save(entity);
    } catch (error) {
      // existsByEmail の確認と保存の間に、別のリクエストが同じメールを登録した場合に起きる
      if (isUniqueViolation(error, UQ_CUSTOMERS_EMAIL)) {
        throw new EmailAlreadyExistsError(customer.getEmail().getValue());
      }
      throw error;
    }
  }

  async delete(id: CustomerId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  private toDomain(entity: CustomerEntity): Customer {
    let address: Address | null = null;

    if (entity.shippingPostalCode && entity.shippingPrefecture && entity.shippingCity && entity.shippingStreet) {
      address = Address.create(
        entity.shippingPostalCode,
        entity.shippingPrefecture,
        entity.shippingCity,
        entity.shippingStreet,
        entity.shippingBuilding
      );
    }

    return Customer.reconstruct({
      id: CustomerId.fromString(entity.id),
      name: entity.name,
      email: Email.create(entity.email),
      shippingAddress: address,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();
    const address = customer.getShippingAddress();

    entity.id = customer.getId().getValue();
    entity.name = customer.getName();
    entity.email = customer.getEmail().getValue();

    if (address) {
      entity.shippingPostalCode = address.getPostalCode();
      entity.shippingPrefecture = address.getPrefecture();
      entity.shippingCity = address.getCity();
      entity.shippingStreet = address.getStreet();
      entity.shippingBuilding = address.getBuilding();
    }

    entity.createdAt = customer.getCreatedAt();
    entity.updatedAt = customer.getUpdatedAt();

    return entity;
  }
}
