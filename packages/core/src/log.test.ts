import { noopLog } from "./log";
import { testPlugin } from "./testPlugin";

test("Log interface", () => {
  // $ExpectType void
  noopLog();

  // $ExpectType number
  noopLog("a", 1);

  // $ExpectType void
  noopLog(...[]);

  // $ExpectType number | void
  noopLog(...[1]);
});

test("applying plugins", () => {
  const log = noopLog
    .add(
      (data) => {
        expect(data).toMatchInlineSnapshot(`
          {
            "args": [
              1,
              "a",
              "b",
              "c",
            ],
            "meta": {
              Symbol(testPluginSymbol): "abc",
            },
          }
        `);
        return data;
      },
      testPlugin("c"),
      testPlugin("b")
    )
    .add(testPlugin("a"));
  log(1);
});
