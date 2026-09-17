import { container } from './container';

// tsoa.json の iocModule から参照され、生成されたルートがコントローラーを解決するときに使われる
export const iocContainer = {
  get<T>(controller: new (...args: unknown[]) => T): T {
    return container.get<T>(controller);
  },
};
