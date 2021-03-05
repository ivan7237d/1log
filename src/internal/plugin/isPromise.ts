export const isPromise = (value: unknown): value is Promise<unknown> =>
  value !== null &&
  value !== undefined &&
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
  (value as any).constructor === Promise;
