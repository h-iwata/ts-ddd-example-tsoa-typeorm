import { type OrderId, type CustomerId , type Money } from '../value-objects';

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
    readonly orderId: OrderId,
    readonly customerId: CustomerId
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
    readonly orderId: OrderId,
    readonly totalAmount: Money
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
    readonly orderId: OrderId,
    readonly reason?: string
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
    readonly orderId: OrderId,
    readonly trackingNumber?: string
  ) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}
