import { areTimersFake, getTimeDelta, resetTimeDelta } from "./timeDelta";

afterEach(() => {
  jest.useRealTimers();
  resetTimeDelta();
});

test("areTimersFake", () => {
  expect(areTimersFake()).toMatchInlineSnapshot(`false`);
  jest.useFakeTimers({ legacyFakeTimers: true });
  expect(areTimersFake()).toMatchInlineSnapshot(`true`);
  jest.useRealTimers();
  jest.useFakeTimers();
  expect(areTimersFake()).toMatchInlineSnapshot(`true`);
});

test.each(["legacy", "modern"] as const)("getTimeDelta, %s timers", (type) => {
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
  jest.useFakeTimers({
    legacyFakeTimers: type === "legacy",
  });
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
  jest.advanceTimersByTime(1);
  expect(getTimeDelta()).toMatchInlineSnapshot(`1`);
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
});
