import { hexToRgb } from "./hexToRgb";

it("works", () => {
  expect(hexToRgb("#000000")).toMatchInlineSnapshot(`
    [
      0,
      0,
      0,
    ]
  `);
  expect(hexToRgb("#ffffff")).toMatchInlineSnapshot(`
    [
      255,
      255,
      255,
    ]
  `);
  expect(hexToRgb("#aabbcc")).toMatchInlineSnapshot(`
    [
      170,
      187,
      204,
    ]
  `);
  expect(() => hexToRgb("fff")).toThrowErrorMatchingInlineSnapshot(
    `"Invalid color "fff". Must be in non-shorthand hex format, e.g. "#ffffff"."`
  );
  expect(() => hexToRgb("#ffg")).toThrowErrorMatchingInlineSnapshot(
    `"Invalid color "#ffg". Must be in non-shorthand hex format, e.g. "#ffffff"."`
  );
  expect(() => hexToRgb("#ffffffff")).toThrowErrorMatchingInlineSnapshot(
    `"Invalid color "#ffffffff". Must be in non-shorthand hex format, e.g. "#ffffff"."`
  );
  expect(() => hexToRgb("")).toThrowErrorMatchingInlineSnapshot(
    `"Invalid color "". Must be in non-shorthand hex format, e.g. "#ffffff"."`
  );
  expect(() => hexToRgb("@000000")).toThrowErrorMatchingInlineSnapshot(
    `"Invalid color "@000000". Must be in non-shorthand hex format, e.g. "#ffffff"."`
  );
  expect(() => hexToRgb("#fff")).toThrowErrorMatchingInlineSnapshot(
    `"Invalid color "#fff". Must be in non-shorthand hex format, e.g. "#ffffff"."`
  );
});
