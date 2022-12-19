import { resetLog, voidLog } from "@1log/core";
import { jestPlugin, readLog } from "@1log/jest";
import { getLogFunction } from ".";

const log = voidLog.add(jestPlugin());
const logFunction = getLogFunction(log);

afterEach(() => {
  resetLog();
});

test("both args, call, return", () => {
  // $ExpectType (x: number) => number
  const f = logFunction("client", (x: number) => x + 1);
  f(1);
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [call 1] 1
    > [client] [1] [return] 2
  `);
});

test("only function as arg", () => {
  // $ExpectType (x: number) => number
  const f = logFunction((x: number) => x + 1);
  f(1);
  expect(readLog()).toMatchInlineSnapshot(`
    > [call 1] 1
    > [1] [return] 2
  `);
});

test("only label as arg", () => {
  // $ExpectType (x: number) => number
  const f = logFunction("client")((x: number) => x + 1);
  f(1);
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [call 1] 1
    > [client] [1] [return] 2
  `);
});

test("label in options", () => {
  logFunction({ labelCaption: "client" }, (x: number) => x + 1)(1);
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [call 1] 1
    > [client] [1] [return] 2
  `);
});

test("filter, throw", () => {
  logFunction({ filter: ["call"] }, (x: number) => x + 1)(1);
  expect(readLog()).toMatchInlineSnapshot(`> [call 1] 1`);

  logFunction({ filter: ["return"] }, (x: number) => x + 1)(1);
  expect(readLog()).toMatchInlineSnapshot(`> [1] [return] 2`);

  const f = logFunction({ filter: ["throw"] }, () => {
    throw new Error("a");
  });
  expect(f).toThrowErrorMatchingInlineSnapshot(`"a"`);
  expect(readLog()).toMatchInlineSnapshot(`> [1] [throw] [Error: a]`);
});

test("count", () => {
  const f = logFunction((x: number): number => (x > 0 ? f(x - 1) * 2 : 10));
  f(1);
  expect(readLog()).toMatchInlineSnapshot(`
    > [call 1] 1
    > [call 2] 0
    > [2] [return] 10
    > [1] [return] 20
  `);
});

test("return promise", async () => {
  const f = logFunction("client", (x: number) => Promise.resolve(x + 1));
  await f(1);
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [call 1] 1
    > [client] [1] [return promise]
    > [client] [1] [resolve] 2
  `);
});

test("examples in readme", async () => {
  const f = logFunction((x: number) => x + 1);
  f(1);
  expect(readLog()).toMatchInlineSnapshot(`
    > [call 1] 1
    > [1] [return] 2
  `);
  f(10);
  expect(readLog()).toMatchInlineSnapshot(`
    > [call 2] 10
    > [2] [return] 11
  `);
  const g = logFunction(async () => Promise.resolve(1));
  await g();
  expect(readLog()).toMatchInlineSnapshot(`
    > [call 1]
    > [1] [return promise]
    > [1] [resolve] 1
  `);
});
