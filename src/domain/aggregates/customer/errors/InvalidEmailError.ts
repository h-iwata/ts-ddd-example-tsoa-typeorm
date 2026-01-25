import { DomainError } from '../../../shared/errors';

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
  }
}
