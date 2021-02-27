import { pipe } from 'antiutils';
import { log } from '../logger/logger';
import { badgePlugin } from './badgePlugin';
import { iterablePlugin } from './iterablePlugin';
import { getMessages } from './mockHandlerPlugin';

test('basic usage', () => {
  const iterable = pipe(
    new Set([1, 2]).values(),
    log(badgePlugin('myIterable'))(iterablePlugin),
  );
  expect(getMessages()).toMatchInlineSnapshot(
    `[myIterable] [create 1] +0ms [IterableIterator]`,
  );
  expect([...iterable]).toMatchInlineSnapshot(`
    Array [
      1,
      2,
    ]
  `);
  expect(getMessages()).toMatchInlineSnapshot(`
    [myIterable] [create 1] [next] +0ms
    [myIterable] [create 1] [yield] +0ms 1
    [myIterable] [create 1] [next] +0ms
    [myIterable] [create 1] [yield] +0ms 2
    [myIterable] [create 1] [next] +0ms
    [myIterable] [create 1] [done] +0ms undefined
  `);
});

test('stack level', () => {
  [
    ...pipe(
      new Set([1]).values(),
      log(iterablePlugin),
      log(iterablePlugin),
      log(iterablePlugin),
    ),
  ];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [IterableIterator]
    [create 2] +0ms [IterableIterator]
    [create 3] +0ms [IterableIterator]
    [create 3] [next] +0ms
    · [create 2] [next] +0ms
    · · [create 1] [next] +0ms
    · · [create 1] [yield] +0ms 1
    · [create 2] [yield] +0ms 1
    [create 3] [yield] +0ms 1
    [create 3] [next] +0ms
    · [create 2] [next] +0ms
    · · [create 1] [next] +0ms
    · · [create 1] [done] +0ms undefined
    · [create 2] [done] +0ms undefined
    [create 3] [done] +0ms undefined
  `);
});

test('returned value', () => {
  const generatorFunction = function* () {
    yield 1;
    return 2;
  };
  [...log(generatorFunction())];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [IterableIterator]
    [create 1] [next] +0ms
    [create 1] [yield] +0ms 1
    [create 1] [next] +0ms
    [create 1] [done] +0ms 2
  `);
});
