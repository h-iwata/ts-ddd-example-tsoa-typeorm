export interface LogFields {
  [key: string]: unknown;
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

// Errorは列挙可能なプロパティを持たないため、JSON.stringifyに渡すと {} になる
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { name: 'UnknownError', message: String(error) };
}

function write(level: string, fields: LogFields, message: string): void {
  const record = { level, time: new Date().toISOString(), message, ...fields };
  let line: string;
  try {
    line = JSON.stringify(record);
  } catch {
    // 循環参照などで直列化できないとき、ログの失敗でリクエスト処理を巻き添えにしない
    line = JSON.stringify({ level, time: new Date().toISOString(), message, serializationFailed: true });
  }
  // biome-ignore lint/suspicious/noConsole: ここがアプリ唯一のconsole出力口
  console.error(line);
}

// 引数の順序はpinoに合わせてある。差し替えるときは実装だけを入れ替えればよい
export const logger = {
  error(fields: LogFields, message: string): void {
    write('error', fields, message);
  },
  warn(fields: LogFields, message: string): void {
    write('warn', fields, message);
  },
  info(fields: LogFields, message: string): void {
    write('info', fields, message);
  },
};
