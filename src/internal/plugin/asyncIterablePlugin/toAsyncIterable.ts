export const toAsyncIterable = async function* <T>(
  source: AsyncIterable<T>,
): AsyncIterableIterator<T> {
  for await (const value of source) {
    yield value;
  }
};
