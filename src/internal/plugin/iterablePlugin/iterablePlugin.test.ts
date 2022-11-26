import { pipe } from "antiutils";
import { log } from "../../logger/logger";
import { badgePlugin } from "../badgePlugin";
import { getMessages } from "../mockHandlerPlugin";
import { toIterable } from "./toIterable";

test("basic usage", () => {
  const iterable = pipe(
    new Set([1, 2]).values(),
    log(badgePlugin("myIterable"))
  );
  expect(getMessages()).toMatchInlineSnapshot(
    `[myIterable] [create 1] +0ms [IterableIterator]`
  );
  expect([...iterable]).toMatchInlineSnapshot(`
    [
      1,
      2,
    ]
  `);
  expect(getMessages()).toMatchInlineSnapshot(`
    [myIterable] [create 1] [next 1] +0ms
    [myIterable] [create 1] [next 1] [yield] +0ms 1
    [myIterable] [create 1] [next 2] +0ms
    [myIterable] [create 1] [next 2] [yield] +0ms 2
    [myIterable] [create 1] [next 3] +0ms
    [myIterable] [create 1] [next 3] [done] +0ms undefined
  `);
});

test("stack level", () => {
  [...pipe(new Set([1]).values(), log, log, log)];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [IterableIterator]
    [create 2] +0ms [IterableIterator]
    [create 3] +0ms [IterableIterator]
    [create 3] [next 1] +0ms
    · [create 2] [next 1] +0ms
    · · [create 1] [next 1] +0ms
    · · [create 1] [next 1] [yield] +0ms 1
    · [create 2] [next 1] [yield] +0ms 1
    [create 3] [next 1] [yield] +0ms 1
    [create 3] [next 2] +0ms
    · [create 2] [next 2] +0ms
    · · [create 1] [next 2] +0ms
    · · [create 1] [next 2] [done] +0ms undefined
    · [create 2] [next 2] [done] +0ms undefined
    [create 3] [next 2] [done] +0ms undefined
  `);
});

test("returned value", () => {
  const generatorFunction = function* () {
    yield 1;
    return 2;
  };
  [...log(generatorFunction())];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [IterableIterator]
    [create 1] [next 1] +0ms
    [create 1] [next 1] [yield] +0ms 1
    [create 1] [next 2] +0ms
    [create 1] [next 2] [done] +0ms 2
  `);
});

test("argument passed to next", () => {
  const generatorFunction = function* (): Generator<number, void, number> {
    log(badgePlugin("yield result"))(yield 1);
  };
  const iterator = log(generatorFunction());
  iterator.next();
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [IterableIterator]
    [create 1] [next 1] +0ms
    [create 1] [next 1] [yield] +0ms 1
  `);
  iterator.next(42);
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] [next 2] +0ms 42
    · [yield result] +0ms 42
    [create 1] [next 2] [done] +0ms undefined
  `);
});

test("toIterable", () => {
  [...log(toIterable(new Set([1, 2])))];
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [IterableIterator]
    [create 1] [next 1] +0ms
    [create 1] [next 1] [yield] +0ms 1
    [create 1] [next 2] +0ms
    [create 1] [next 2] [yield] +0ms 2
    [create 1] [next 3] +0ms
    [create 1] [next 3] [done] +0ms undefined
  `);
});
