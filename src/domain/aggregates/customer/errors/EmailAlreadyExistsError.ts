import { ConflictError } from '../../../shared/errors';

export class EmailAlreadyExistsError extends ConflictError {
  readonly code = 'EMAIL_ALREADY_EXISTS';
  constructor(email: string) {
    super(`このメールアドレスは既に登録されています: ${email}`);
  }
}
