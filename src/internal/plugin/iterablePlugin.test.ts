import { applyPipe } from 'antiutils';
import { log } from '../logger/logger';
import { badgePlugin } from './badgePlugin';
import { iterablePlugin } from './iterablePlugin';
import { getMessages } from './mockHandlerPlugin';

test('basic usage', () => {
  const iterable = applyPipe(
    [1, 2],
    log(badgePlugin('myIterable'))(iterablePlugin),
  );
  expect(getMessages()).toMatchInlineSnapshot(`
    [myIterable] [create 1] +0ms
      Array [
        1,
        2,
      ]
  `);
  expect([...iterable]).toMatchInlineSnapshot(`
    Array [
      1,
      2,
    ]
  `);
  expect(getMessages()).toMatchInlineSnapshot(`
    [myIterable] [create 1] [call 1] +0ms
    [myIterable] [create 1] [call 1] [next] +0ms
    [myIterable] [create 1] [call 1] [yield] +0ms 1
    [myIterable] [create 1] [call 1] [next] +0ms
    [myIterable] [create 1] [call 1] [yield] +0ms 2
    [myIterable] [create 1] [call 1] [next] +0ms
    [myIterable] [create 1] [call 1] [done] +0ms
  `);
});

test('multiple calls', () => {
  const iterable = applyPipe([1], log(iterablePlugin));
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms
      Array [
        1,
      ]
  `);
  [...iterable];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] [call 1] +0ms
    [create 1] [call 1] [next] +0ms
    [create 1] [call 1] [yield] +0ms 1
    [create 1] [call 1] [next] +0ms
    [create 1] [call 1] [done] +0ms
  `);
  [...iterable];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] [call 2] +0ms
    [create 1] [call 2] [next] +0ms
    [create 1] [call 2] [yield] +0ms 1
    [create 1] [call 2] [next] +0ms
    [create 1] [call 2] [done] +0ms
  `);
});

test('stack level', () => {
  [
    ...applyPipe(
      [1],
      log(iterablePlugin),
      log(iterablePlugin),
      log(iterablePlugin),
    ),
  ];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms
      Array [
        1,
      ]
    [create 2] +0ms
      Object {
        Symbol(Symbol.iterator): [Function],
      }
    [create 3] +0ms
      Object {
        Symbol(Symbol.iterator): [Function],
      }
    [create 3] [call 1] +0ms
    · [create 2] [call 1] +0ms
    · · [create 1] [call 1] +0ms
    [create 3] [call 1] [next] +0ms
    · [create 2] [call 1] [next] +0ms
    · · [create 1] [call 1] [next] +0ms
    · · [create 1] [call 1] [yield] +0ms 1
    · [create 2] [call 1] [yield] +0ms 1
    [create 3] [call 1] [yield] +0ms 1
    [create 3] [call 1] [next] +0ms
    · [create 2] [call 1] [next] +0ms
    · · [create 1] [call 1] [next] +0ms
    · · [create 1] [call 1] [done] +0ms
    · [create 2] [call 1] [done] +0ms
    [create 3] [call 1] [done] +0ms
  `);
});
