import { getTimeDelta, resetTimeDelta } from "./timeDelta";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  resetTimeDelta();
});

test("getTimeDelta", () => {
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
  jest.advanceTimersByTime(17);
  expect(getTimeDelta()).toMatchInlineSnapshot(`17`);
  jest.advanceTimersByTime(16);
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
  jest.advanceTimersByTime(16);
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
});
