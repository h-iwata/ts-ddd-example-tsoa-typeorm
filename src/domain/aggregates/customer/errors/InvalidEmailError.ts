import { ValidationError } from '../../../shared/errors';

export class InvalidEmailError extends ValidationError {
  readonly code = 'INVALID_EMAIL';
  constructor(email: string) {
    super(`無効なメールアドレス形式です: ${email}`);
  }
}
