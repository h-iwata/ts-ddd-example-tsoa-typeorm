import { injectable } from 'inversify';
import { Customer, CustomerId, Email } from '../../../domain/aggregates/customer';
import { ICustomerRepository } from '../../../domain/repositories';

@injectable()
export class InMemoryCustomerRepository implements ICustomerRepository {
  private customers: Map<string, Customer> = new Map();

  async findById(id: CustomerId): Promise<Customer | null> {
    return this.customers.get(id.getValue()) ?? null;
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    for (const customer of this.customers.values()) {
      if (customer.getEmail().equals(email)) {
        return customer;
      }
    }
    return null;
  }

  async findAll(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.getId().getValue(), customer);
  }

  async delete(id: CustomerId): Promise<void> {
    this.customers.delete(id.getValue());
  }

  async existsByEmail(email: Email): Promise<boolean> {
    for (const customer of this.customers.values()) {
      if (customer.getEmail().equals(email)) {
        return true;
      }
    }
    return false;
  }
}
