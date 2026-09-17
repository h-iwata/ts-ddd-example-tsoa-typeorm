import { ValidationError } from './base';

export class InvalidIdError extends ValidationError {
  readonly code = 'INVALID_ID';
  constructor(idName: string) {
    super(`${idName}は空にできません`);
  }
}
