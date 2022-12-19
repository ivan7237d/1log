import { voidLog } from "@1log/core";
import { jestPlugin, readLog } from "@1log/jest";
import { getLogPromise } from ".";

const log = voidLog.add(jestPlugin());
const logPromise = getLogPromise(log);

afterEach(() => {
  readLog();
});

test("both args", async () => {
  const promise = Promise.resolve(1);
  // $ExpectType Promise<number>
  logPromise("client", promise);
  await promise;
  expect(readLog()).toMatchInlineSnapshot(`> [client] [resolve] 1`);
});

test("only promise as arg", async () => {
  const promise = Promise.resolve(1);
  // $ExpectType Promise<number>
  logPromise(promise);
  await promise;
  expect(readLog()).toMatchInlineSnapshot(`> [resolve] 1`);
});

test("only label as arg", async () => {
  const promise = Promise.resolve(1);
  // $ExpectType Promise<number>
  logPromise("client")(promise);
  await promise;
  expect(readLog()).toMatchInlineSnapshot(`> [client] [resolve] 1`);
});

test("returned value", async () => {
  const promise = Promise.resolve(1);
  const proxy = logPromise("client", promise);
  logPromise("proxy", proxy);
  await proxy;
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [resolve] 1
    > [proxy] [resolve] 1
  `);
});

test("rejection", async () => {
  const promise = Promise.reject(1);
  const proxy = logPromise("client", promise);
  await logPromise("proxy", proxy).catch(() => {});
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [reject] 1
    > [proxy] [reject] 1
  `);
});