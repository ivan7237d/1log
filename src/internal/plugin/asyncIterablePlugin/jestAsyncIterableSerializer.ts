export const jestAsyncIterableSerializer: import('pretty-format').NewPlugin = {
  test: (value) =>
    value !== undefined &&
    value !== null &&
    value[Symbol.asyncIterator]?.() === value,
  serialize: () => `[AsyncIterableIterator]`,
};
