import { applyPipe } from 'antiutils';
import { log } from '../logger/logger';
import { getMessages } from './mockHandlerPlugin';

const getPromise = () => {
  let resolve: unknown;
  let reject: unknown;
  const promise = new Promise((resolveLocal, rejectLocal) => {
    resolve = resolveLocal;
    reject = rejectLocal;
  });
  return {
    promise,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    resolve: resolve as (value?: unknown) => void,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    reject: reject as (reason?: any) => void,
  };
};

test('resolve', async () => {
  const { promise, resolve } = getPromise();
  const promise2 = applyPipe(promise, log);
  expect(getMessages()).toMatchInlineSnapshot(`[create 1] +0ms Promise {}`);
  resolve(42);
  expect(getMessages()).toMatchInlineSnapshot(`[No log messages]`);
  expect(await promise2).toMatchInlineSnapshot(`42`);
  expect(getMessages()).toMatchInlineSnapshot(`[create 1] [resolve] +0ms 42`);
});

test('reject', async () => {
  const { promise, reject } = getPromise();
  const promise2 = applyPipe(promise, log);
  expect(getMessages()).toMatchInlineSnapshot(`[create 1] +0ms Promise {}`);
  reject(42);
  expect(getMessages()).toMatchInlineSnapshot(`[No log messages]`);
  await expect(promise2).rejects.toMatchInlineSnapshot(`42`);
  expect(getMessages()).toMatchInlineSnapshot(`[create 1] [reject] +0ms 42`);
});
