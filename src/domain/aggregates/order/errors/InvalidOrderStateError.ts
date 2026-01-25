import { DomainError } from '../../../shared/errors';

export class InvalidOrderStateError extends DomainError {
  readonly code = 'INVALID_ORDER_STATE';
  constructor(currentState: string, action: string) {
    super(`${currentState}状態の注文に対して「${action}」操作はできません`);
  }
}
