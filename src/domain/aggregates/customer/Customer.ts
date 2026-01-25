import { Address } from '../../shared/value-objects';
import { CustomerId } from './CustomerId';
import { Email } from './Email';

/**
 * 顧客集約ルート
 */
export class Customer {
  private constructor(
    private readonly id: CustomerId,
    private name: string,
    private email: Email,
    private shippingAddress: Address | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(name: string, email: Email): Customer {
    const now = new Date();
    return new Customer(
      CustomerId.generate(),
      name,
      email,
      null,
      now,
      now
    );
  }

  static reconstruct(
    id: CustomerId,
    name: string,
    email: Email,
    shippingAddress: Address | null,
    createdAt: Date,
    updatedAt: Date
  ): Customer {
    return new Customer(id, name, email, shippingAddress, createdAt, updatedAt);
  }

  getId(): CustomerId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getShippingAddress(): Address | null {
    return this.shippingAddress;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * 配送先住所を設定
   */
  setShippingAddress(address: Address): void {
    this.shippingAddress = address;
    this.updatedAt = new Date();
  }

  /**
   * プロフィールを更新
   */
  updateProfile(name: string, email: Email): void {
    this.name = name;
    this.email = email;
    this.updatedAt = new Date();
  }

  /**
   * 配送先が設定されているか
   */
  hasShippingAddress(): boolean {
    return this.shippingAddress !== null;
  }
}
