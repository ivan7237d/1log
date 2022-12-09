import { label, labels } from "./label";
import { voidLog } from "./log";
import { testPlugin } from "./testPlugin";

test("adding labels, meta type", () => {
  const log = voidLog.add(
    (data) => {
      // $ExpectType Label[] | undefined
      data.meta[labels];
      expect(data).toMatchInlineSnapshot(`
        {
          "args": [
            "a",
          ],
          "meta": {
            Symbol(testPluginSymbol): "a",
            Symbol(labels): [
              {
                "caption": "label1",
              },
              {
                "caption": "label2",
                "color": "amber",
              },
            ],
          },
        }
      `);
      return data;
    },
    label("label1"),
    label({ caption: "label2", color: "amber" }),
    testPlugin("a")
  );
  log();
});
