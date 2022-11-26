import {
  excludeFromTimeDelta,
  getTimeDelta,
  includeInTimeDelta,
  resetTimeDelta,
} from "./timeDelta";

test("basic usage", () => {
  jest.advanceTimersByTime(1);
  excludeFromTimeDelta(() => {
    jest.advanceTimersByTime(10);
    includeInTimeDelta(() => {
      jest.advanceTimersByTime(100);
    })();
    expect(getTimeDelta()).toMatchInlineSnapshot(`101`);
    expect(getTimeDelta()).toMatchInlineSnapshot(`0`);
  })();
  jest.advanceTimersByTime(1);
  resetTimeDelta();
  excludeFromTimeDelta(() => {
    expect(getTimeDelta()).toMatchInlineSnapshot(`0`);
  })();
});

test("errors", () => {
  expect(getTimeDelta).toThrowErrorMatchingInlineSnapshot(
    `"getTimeDelta cannot be called while we're counting time towards delta."`
  );
  excludeFromTimeDelta(() => {
    expect(resetTimeDelta).toThrowErrorMatchingInlineSnapshot(
      `"resetTimeDelta cannot be called while we're not counting time towards delta."`
    );
  })();
});

test("superflous excludes/includes do not throw", () => {
  excludeFromTimeDelta(() => {
    excludeFromTimeDelta(() => {
      expect(getTimeDelta()).toMatchInlineSnapshot(`0`);
      includeInTimeDelta(() => {
        includeInTimeDelta(() => {
          resetTimeDelta();
        })();
      })();
    })();
  })();
});
