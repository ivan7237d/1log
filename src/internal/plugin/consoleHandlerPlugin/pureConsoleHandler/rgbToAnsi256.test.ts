import { rgbToAnsi256 } from './rgbToAnsi256';

it('works', () => {
  expect(rgbToAnsi256(0, 0, 0)).toMatchInlineSnapshot(`16`);
  expect(rgbToAnsi256(255, 255, 255)).toMatchInlineSnapshot(`231`);
  expect(rgbToAnsi256(67, 67, 67)).toMatchInlineSnapshot(`238`);
  // Not sure why this is 105, not 63, but for now just using the logic from
  // ansi-styles.
  expect(rgbToAnsi256(95, 95, 255)).toMatchInlineSnapshot(`105`);
});
