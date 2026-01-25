/**
 * 結果型 - 成功/失敗を型安全に表現
 */
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { success: true, value };
  },

  fail<E>(error: E): Result<never, E> {
    return { success: false, error };
  },

  isOk<T, E>(result: Result<T, E>): result is { success: true; value: T } {
    return result.success;
  },

  isFail<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return !result.success;
  },
};
