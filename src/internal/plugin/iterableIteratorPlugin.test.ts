import { applyPipe } from 'antiutils';
import { log } from '../logger/logger';
import { badgePlugin } from './badgePlugin';
import { iterableIteratorPlugin } from './iterableIteratorPlugin';
import { getMessages } from './mockHandlerPlugin';

test('basic usage', () => {
  const iterable = applyPipe(
    new Set([1, 2]).values(),
    log(badgePlugin('myIterable'))(iterableIteratorPlugin),
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
    [myIterable] [create 1] [done] +0ms
  `);
});

test('stack level', () => {
  [
    ...applyPipe(
      new Set([1]).values(),
      log(iterableIteratorPlugin),
      log(iterableIteratorPlugin),
      log(iterableIteratorPlugin),
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
    · · [create 1] [done] +0ms
    · [create 2] [done] +0ms
    [create 3] [done] +0ms
  `);
});
