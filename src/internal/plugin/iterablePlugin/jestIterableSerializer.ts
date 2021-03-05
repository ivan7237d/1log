export const jestIterableSerializer: import('pretty-format').NewPlugin = {
  test: (value) =>
    value !== undefined &&
    value !== null &&
    value[Symbol.iterator]?.() === value,
  serialize: () => `[IterableIterator]`,
};
