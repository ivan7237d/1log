import { pipe } from "antiutils";

/**
 * @internal
 */
export const hexToRgb = (source: string): [number, number, number] =>
  pipe(
    source.startsWith("#") ? source.substring(1).match(/.{2}/g) : [],
    (value) => value!.map((value) => parseInt(value, 16)),
    (value) => {
      if (value.length === 3 && value.every(Number.isFinite)) {
        return value as [number, number, number];
      } else {
        throw new Error(
          `Invalid color "${source}". Must be in non-shorthand hex format, e.g. "#ffffff".`
        );
      }
    }
  );
