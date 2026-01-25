import { OrderId, CustomerId } from '../value-objects';
import { Money } from '../value-objects';

/**
 * ドメインイベントの基底インターフェース
 */
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType: string;
}

/**
 * 注文が作成された
 */
export class OrderCreatedEvent implements DomainEvent {
  readonly eventType = 'OrderCreated';
  readonly eventId: string;
  readonly occurredAt: Date;

  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

/**
 * 注文が確定された
 */
export class OrderConfirmedEvent implements DomainEvent {
  readonly eventType = 'OrderConfirmed';
  readonly eventId: string;
  readonly occurredAt: Date;

  constructor(
    public readonly orderId: OrderId,
    public readonly totalAmount: Money
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

/**
 * 注文がキャンセルされた
 */
export class OrderCancelledEvent implements DomainEvent {
  readonly eventType = 'OrderCancelled';
  readonly eventId: string;
  readonly occurredAt: Date;

  constructor(
    public readonly orderId: OrderId,
    public readonly reason?: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

/**
 * 注文が発送された
 */
export class OrderShippedEvent implements DomainEvent {
  readonly eventType = 'OrderShipped';
  readonly eventId: string;
  readonly occurredAt: Date;

  constructor(
    public readonly orderId: OrderId,
    public readonly trackingNumber?: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}
