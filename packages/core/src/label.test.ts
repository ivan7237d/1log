import { label, labelsSymbol } from "./label";
import { noopLog } from "./log";
import { testPlugin } from "./testPlugin";

test("adding labels, meta type", () => {
  const log = noopLog.add(
    (data) => {
      // $ExpectType Label[] | undefined
      data.meta[labelsSymbol];
      expect(data).toMatchInlineSnapshot(`
        {
          "args": [
            "a",
          ],
          "meta": {
            Symbol(testPluginSymbol): "a",
            Symbol(labelsSymbol): [
              {
                "caption": "label1",
              },
              {
                "caption": "label2",
                "color": "yellow",
              },
            ],
          },
        }
      `);
      return data;
    },
    label("label1"),
    label({ caption: "label2", color: "yellow" }),
    testPlugin("a")
  );
  log();
});
