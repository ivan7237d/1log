export const toIterable = function* <T>(
  source: Iterable<T>
): IterableIterator<T> {
  for (const value of source) {
    yield value;
  }
};
