export const isPromise = (value: unknown): value is Promise<unknown> =>
  value !== null &&
  value !== undefined &&
  (value as any).constructor === Promise;
