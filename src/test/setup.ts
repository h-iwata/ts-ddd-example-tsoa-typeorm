import 'reflect-metadata';

// RSpec風のcontext記法を有効化

declare global {
  var context: typeof describe;
}
global.context = describe;
