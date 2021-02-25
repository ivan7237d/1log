import { Severity } from '../../../logger/severity';
import { logPalette } from '../../../logPalette';
import { LogStyle } from '../logStyle';
import { pureConsoleHandler } from './pch';

const getHandlerLocal = ({
  logStyle,
  maxLength,
}: {
  logStyle: LogStyle;
  maxLength?: number;
}) => {
  const messages: unknown[] = [];
  return {
    handler: pureConsoleHandler({
      getImpureHandler: (severity) => (...data) => {
        messages.push([severity, ...data]);
      },
      logStyle,
      maxLength,
    }),
    getMessages: () => {
      const messagesLocal = messages.slice();
      messages.length = 0;
      return messagesLocal;
    },
  };
};

it('renders css-styled messages correctly', () => {
  const { handler, getMessages } = getHandlerLocal({
    logStyle: 'css',
  });

  handler({
    severity: Severity.error,
    stackLevel: 2,
    badges: [
      { color: logPalette.blue, caption: '<caption 1>' },
      { color: logPalette.purple, caption: '<caption 2>' },
    ],
    timeDelta: 9,
    data: ['<value 1>', '<value 2>'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        40,
        "%cERROR%c%c %c%c·%c%c %c%c·%c%c %c%c<caption 1>%c%c %c%c<caption 2>%c%c %c%c+9ms%c",
        "color: #c0c0c0",
        "",
        "",
        "",
        "color: #c0c0c0",
        "",
        "",
        "",
        "color: #c0c0c0",
        "",
        "",
        "",
        "background: #29a9fb; color: #ffffff; padding: 0 3px;",
        "",
        "",
        "",
        "background: #bc73e2; color: #ffffff; padding: 0 3px;",
        "",
        "",
        "",
        "font-style: italic; color: #c0c0c0",
        "",
        "<value 1>",
        "<value 2>",
      ],
    ]
  `);

  // Check rendering of time delta (1 of 2).
  handler({
    stackLevel: 0,
    badges: [{ color: logPalette.blue, caption: '<caption 1>' }],
    timeDelta: 10,
    data: ['<data>'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "%c<caption 1>%c%c %c%c+10ms%c",
        "background: #29a9fb; color: #ffffff; padding: 0 3px;",
        "",
        "",
        "",
        "font-style: italic",
        "",
        "<data>",
      ],
    ]
  `);

  // Check rendering of time delta (2 of 2).
  handler({
    stackLevel: 0,
    badges: [{ color: logPalette.blue, caption: '<caption 1>' }],
    timeDelta: 1000,
    data: ['<data>'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "%c<caption 1>%c%c %c%c+1.000s%c",
        "background: #29a9fb; color: #ffffff; padding: 0 3px;",
        "",
        "",
        "",
        "font-style: italic; font-weight: bold",
        "",
        "<data>",
      ],
    ]
  `);
});

it('renders ansi-styled messages correctly', () => {
  const { handler, getMessages } = getHandlerLocal({
    logStyle: 'ansi',
  });

  handler({
    severity: Severity.error,
    stackLevel: 2,
    badges: [
      { color: logPalette.blue, caption: '<caption 1>' },
      { color: logPalette.purple, caption: '<caption 2>' },
    ],
    timeDelta: 9,
    data: ['<value 1>', '<value 2>'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        40,
        "[38;5;210mERROR[0m [2m·[0m [2m·[0m [38;5;75m[<caption 1>][0m [38;5;176m[<caption 2>][0m [2;3m+9ms[0m",
        "<value 1>",
        "<value 2>",
      ],
    ]
  `);

  // Check rendering of time delta (1 of 2).
  handler({
    stackLevel: 0,
    badges: [{ color: logPalette.blue, caption: '<caption 1>' }],
    timeDelta: 10,
    data: ['<data>'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "[38;5;75m[<caption 1>][0m [3m+10ms[0m",
        "<data>",
      ],
    ]
  `);

  // Check rendering of time delta (2 of 2).
  handler({
    stackLevel: 0,
    badges: [{ color: logPalette.blue, caption: '<caption 1>' }],
    timeDelta: 1000,
    data: ['<data>'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "[38;5;75m[<caption 1>][0m [1;3m+1.000s[0m",
        "<data>",
      ],
    ]
  `);
});

it('renders unstyled messages correctly', () => {
  const { handler, getMessages } = getHandlerLocal({
    logStyle: 'none',
  });

  handler({
    severity: Severity.error,
    stackLevel: 2,
    badges: [
      { color: logPalette.blue, caption: '<caption 1>' },
      { color: logPalette.purple, caption: '<caption 2>' },
    ],
    timeDelta: 9,
    data: ['<value 1>', '<value 2>'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        40,
        "ERROR · · [<caption 1>] [<caption 2>] +9ms [
     \\"<value 1>\\",
     \\"<value 2>\\"
    ]",
      ],
    ]
  `);

  handler({
    stackLevel: 0,
    badges: [],
    timeDelta: 0,
    data: [],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "+0ms",
      ],
    ]
  `);
});

it('correctly truncates big objects', () => {
  const { handler, getMessages } = getHandlerLocal({
    logStyle: 'none',
    maxLength: 10,
  });

  handler({
    stackLevel: 2,
    badges: [
      { color: logPalette.blue, caption: '<caption 1>' },
      { color: logPalette.purple, caption: '<caption 2>' },
    ],
    timeDelta: 0,
    data: ['abc'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "· · [<caption 1>] [<caption 2>] +0ms [
     \\"abc\\"
    ]",
      ],
    ]
  `);

  handler({
    stackLevel: 2,
    badges: [
      { color: logPalette.blue, caption: '<caption 1>' },
      { color: logPalette.purple, caption: '<caption 2>' },
    ],
    timeDelta: 0,
    data: ['abcd'],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "· · [<caption 1>] [<caption 2>] +0ms [
     \\"abcd\\"
    ... [truncated]",
      ],
    ]
  `);

  const objectWithCircularReference: Record<string, unknown> = {};
  objectWithCircularReference.a = objectWithCircularReference;
  handler({
    stackLevel: 0,
    badges: [],
    timeDelta: 0,
    data: [objectWithCircularReference],
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
        "+0ms [object Object]",
      ],
    ]
  `);
});

it('shows correct severity levels', () => {
  const { handler, getMessages } = getHandlerLocal({
    logStyle: 'ansi',
  });

  handler({
    stackLevel: 0,
    badges: [],
    timeDelta: 0,
    data: [],
    severity: Severity.debug,
  });
  handler({
    stackLevel: 0,
    badges: [],
    timeDelta: 0,
    data: [],
    severity: Severity.info,
  });
  handler({
    stackLevel: 0,
    badges: [],
    timeDelta: 0,
    data: [],
    severity: Severity.warn,
  });
  handler({
    stackLevel: 0,
    badges: [],
    timeDelta: 0,
    data: [],
    severity: Severity.error,
  });
  expect(getMessages()).toMatchInlineSnapshot(`
    Array [
      Array [
        10,
        "[2mDEBUG[0m [2;3m+0ms[0m",
      ],
      Array [
        20,
        "[2mINFO[0m [2;3m+0ms[0m",
      ],
      Array [
        30,
        "[38;5;184mWARNING[0m [2;3m+0ms[0m",
      ],
      Array [
        40,
        "[38;5;210mERROR[0m [2;3m+0ms[0m",
      ],
    ]
  `);
});
