import { voidLog } from "./log";
import { testPlugin } from "./testPlugin";

test("Log interface", () => {
  // $ExpectType void
  voidLog();

  // $ExpectType number
  voidLog("a", 1);

  // $ExpectType void
  voidLog(...[]);

  // $ExpectType number | void
  voidLog(...[1]);
});

test("applying plugins", () => {
  const log = voidLog
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
