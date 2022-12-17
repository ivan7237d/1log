import { formatDuration } from "./formatDuration";

it("", () => {
  expect(formatDuration(0.000003456)).toMatchInlineSnapshot(`"0.000003456ms"`);
  expect(formatDuration(999.4)).toMatchInlineSnapshot(`"999.4ms"`);
  expect(formatDuration(999.5)).toMatchInlineSnapshot(`"1s"`);
  expect(formatDuration(1001)).toMatchInlineSnapshot(`"1.001s"`);
  expect(formatDuration(60 * 1000 - 0.6)).toMatchInlineSnapshot(`"59.999s"`);
  expect(formatDuration(60 * 1000 - 0.4)).toMatchInlineSnapshot(`"1m 0s"`);
  expect(formatDuration(60 * 60 * 1000 - 0.6)).toMatchInlineSnapshot(
    `"59m 59.999s"`
  );
  expect(formatDuration(60 * 60 * 1000 - 0.4)).toMatchInlineSnapshot(
    `"1h 0m 0s"`
  );
  expect(formatDuration(24 * 60 * 60 * 1000 - 0.6)).toMatchInlineSnapshot(
    `"23h 59m 59.999s"`
  );
  expect(formatDuration(24 * 60 * 60 * 1000 - 0.4)).toMatchInlineSnapshot(
    `"1d 0h 0m 0s"`
  );
  expect(
    formatDuration(1000 * 24 * 60 * 60 * 1000 - 0.4)
  ).toMatchInlineSnapshot(`"1000d 0h 0m 0s"`);
});
