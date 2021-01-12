import { formatTime } from './formatTime';

it('works', () => {
  expect(formatTime(0.000003456)).toMatchInlineSnapshot(`"0.00000346ms"`);
  expect(formatTime(999.4)).toMatchInlineSnapshot(`"999ms"`);
  expect(formatTime(999.5)).toMatchInlineSnapshot(`"1.000s"`);
  expect(formatTime(60 * 1000 - 0.6)).toMatchInlineSnapshot(`"59.999s"`);
  expect(formatTime(60 * 1000 - 0.4)).toMatchInlineSnapshot(`"1m 0.000s"`);
  expect(formatTime(60 * 60 * 1000 - 0.6)).toMatchInlineSnapshot(
    `"59m 59.999s"`,
  );
  expect(formatTime(60 * 60 * 1000 - 0.4)).toMatchInlineSnapshot(
    `"1h 0m 0.000s"`,
  );
  expect(formatTime(24 * 60 * 60 * 1000 - 0.6)).toMatchInlineSnapshot(
    `"23h 59m 59.999s"`,
  );
  expect(formatTime(24 * 60 * 60 * 1000 - 0.4)).toMatchInlineSnapshot(
    `"1d 0h 0m 0.000s"`,
  );
  expect(formatTime(1000 * 24 * 60 * 60 * 1000 - 0.4)).toMatchInlineSnapshot(
    `"1,000d 0h 0m 0.000s"`,
  );
});
