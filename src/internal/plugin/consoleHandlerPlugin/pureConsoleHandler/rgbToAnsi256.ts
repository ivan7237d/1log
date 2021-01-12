/**
 * @internal
 */
export const rgbToAnsi256 = (
  red: number,
  green: number,
  blue: number,
): number =>
  red === green && green === blue
    ? // Use greyscale palette.
      red < 8
      ? 16
      : red > 248
      ? 231
      : Math.round(((red - 8) / 247) * 24) + 232
    : 16 +
      36 * Math.round((red / 255) * 5) +
      6 * Math.round((green / 255) * 5) +
      Math.round((blue / 255) * 5);
