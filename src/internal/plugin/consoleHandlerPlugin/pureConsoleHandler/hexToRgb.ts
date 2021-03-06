import { pipe } from 'antiutils';

/**
 * @internal
 */
export const hexToRgb = (source: string): [number, number, number] =>
  pipe(
    source.startsWith('#') ? source.substring(1).match(/.{2}/g) : [],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (value) => value!.map((value) => parseInt(value, 16)),
    (value) => {
      if (value.length === 3 && value.every(Number.isFinite)) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return value as [number, number, number];
      } else {
        throw new Error(
          `Invalid color "${source}". Must be in non-shorthand hex format, e.g. "#ffffff".`,
        );
      }
    },
  );
