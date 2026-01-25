import { DomainError } from '../../../shared/errors';

export class EmailAlreadyExistsError extends DomainError {
  readonly code = 'EMAIL_ALREADY_EXISTS';
  constructor(email: string) {
    super(`このメールアドレスは既に登録されています: ${email}`);
  }
}
