// Run as follows:
// npx ts-node packages/console/scripts/generateAnsiPalette.ts

import { palette } from "@1log/core";
import Color from "colorjs.io";
import { ansiColors } from "./ansiColors";

const getNearestAnsiColor = (baseColor: Color) => {
  let index, delta;
  ansiColors.forEach((ansiColor, currentIndex) => {
    const currentDelta = new Color(ansiColor).deltaE(baseColor, "2000");
    if (delta === undefined || currentDelta < delta) {
      index = currentIndex;
      delta = currentDelta;
    }
  });
  return index;
};

const result = {};

for (const key in palette) {
  const baseColor = new Color(palette[key][600]);
  const ansiColor = getNearestAnsiColor(baseColor);
  result[key] = ansiColor;
  console.log(`\u001B[38;5;${ansiColor}m${key}\u001B[0m: ${ansiColor}`);
}

console.log(result);

const isBun = !!(
  typeof process !== "undefined" &&
  // @ts-ignore
  process.isBun
);

console.log(isBun);
