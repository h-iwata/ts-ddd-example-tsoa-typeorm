import { DomainError } from '../../../shared/errors';

export class InvalidOrderStateError extends DomainError {
  readonly code = 'INVALID_ORDER_STATE';
  constructor(currentState: string, action: string) {
    super(`Cannot ${action} order in ${currentState} state`);
  }
}
