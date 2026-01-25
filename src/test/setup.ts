import 'reflect-metadata';

// RSpec風のcontext記法を有効化
// eslint-disable-next-line no-var
declare global {
  var context: typeof describe;
}
global.context = describe;
