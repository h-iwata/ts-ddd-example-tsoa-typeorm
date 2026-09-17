import { type Customer } from '../aggregates/customer';
import { type CustomerId, type Email } from '../value-objects';

export interface ICustomerRepository {
  findById(id: CustomerId): Promise<Customer | null>;
  findByEmail(email: Email): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  add(customer: Customer): Promise<void>;
  save(customer: Customer): Promise<void>;
  delete(id: CustomerId): Promise<void>;
  existsByEmail(email: Email): Promise<boolean>;
}
