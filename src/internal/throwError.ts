/**
 * @internal
 */
export const throwError = (name: string): never => {
  const error = new Error(
    `Please see https://github.com/ivan7237d/1log#${name.toLowerCase()}`,
  );
  error.name = name;
  throw error;
};
