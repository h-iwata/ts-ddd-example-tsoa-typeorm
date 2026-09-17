import express, { type Express } from 'express';

export interface ObservedResponse {
  method: string;
  path: string;
  status: number;
}

interface OpenApiOperation {
  responses: Record<string, unknown>;
}

export interface OpenApiSpec {
  paths: Record<string, Record<string, OpenApiOperation>>;
}

const observed: ObservedResponse[] = [];

// createApp() はルート登録まで済ませてしまうので、外側にもう一枚アプリを被せて記録する。
// これによりテスト側のリクエスト呼び出しに手を入れずに全レスポンスを観測できる。
export function withResponseRecorder(app: Express): Express {
  const recorder = express();

  recorder.use((req, res, next) => {
    res.on('finish', () => {
      observed.push({ method: req.method.toLowerCase(), path: req.path, status: res.statusCode });
    });
    next();
  });
  recorder.use(app);

  return recorder;
}

function toPathMatcher(specPath: string): RegExp {
  const escaped = specPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\\\{[^}]+\\\}/g, '[^/]+')}$`);
}

function findOperation(spec: OpenApiSpec, response: ObservedResponse): OpenApiOperation | undefined {
  for (const [specPath, operations] of Object.entries(spec.paths)) {
    if (toPathMatcher(specPath).test(response.path)) {
      return operations[response.method];
    }
  }
  return undefined;
}

/**
 * 観測されたのにOpenAPIで宣言されていないレスポンスを返す
 * 仕様に載っていないパス（/docs や /swagger.json）は対象外
 */
export function findUndeclaredResponses(spec: OpenApiSpec): string[] {
  const undeclared = observed
    .filter((response) => {
      const operation = findOperation(spec, response);
      return operation !== undefined && !(String(response.status) in operation.responses);
    })
    .map((response) => `${response.method.toUpperCase()} ${response.path} -> ${response.status}`);

  return [...new Set(undeclared)].sort();
}
