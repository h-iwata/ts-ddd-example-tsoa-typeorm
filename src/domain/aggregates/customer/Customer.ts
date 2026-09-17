import { type Address } from '../../shared/value-objects';
import { CustomerId } from './CustomerId';
import { type Email } from './Email';

export interface CustomerReconstructParams {
  id: CustomerId;
  name: string;
  email: Email;
  shippingAddress: Address | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Customer {
  private constructor(private props: CustomerReconstructParams) {}

  static create(name: string, email: Email): Customer {
    const now = new Date();
    return new Customer({ id: CustomerId.generate(), name, email, shippingAddress: null, createdAt: now, updatedAt: now });
  }

  static reconstruct(params: CustomerReconstructParams): Customer {
    return new Customer(params);
  }

  getId(): CustomerId {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getEmail(): Email {
    return this.props.email;
  }

  getShippingAddress(): Address | null {
    return this.props.shippingAddress;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  setShippingAddress(address: Address): void {
    this.props.shippingAddress = address;
    this.props.updatedAt = new Date();
  }

  updateProfile(name: string, email: Email): void {
    this.props.name = name;
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  hasShippingAddress(): boolean {
    return this.props.shippingAddress !== null;
  }
}
