import { QueryFailedError } from 'typeorm';

const ER_DUP_ENTRY = 1062;

// TypeORMは driverError を Error としか宣言しないが、実際に値を載せるのは mysql2
interface MysqlDriverError {
  errno: number;
  sqlMessage: string;
}

function isMysqlDriverError(error: Error): error is Error & MysqlDriverError {
  return 'errno' in error && typeof error.errno === 'number' && 'sqlMessage' in error && typeof error.sqlMessage === 'string';
}

export function isUniqueViolation(error: unknown, indexName: string): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  if (!isMysqlDriverError(error.driverError)) return false;
  if (error.driverError.errno !== ER_DUP_ENTRY) return false;

  // sqlMessage の形式: Duplicate entry '<値>' for key '<テーブル>.<インデックス名>'
  return error.driverError.sqlMessage.includes(`.${indexName}'`);
}
