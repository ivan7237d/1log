import {
  applyPipe,
  asNever,
  firstIterable,
  flatMapIterable,
  mapIterable,
  rangeIterable,
  zipIterables,
} from 'antiutils';
import { LogMessage } from '../../../logger/handler';
import { normalizeSeverityLevel } from '../../../logger/normalizeSeverityLevel';
import { SeverityLevel } from '../../../logger/severityLevel';
import { logPalette } from '../../../logPalette';
import { LogStyle } from '../logStyle';
import { formatTime } from './formatTime';
import { hexToRgb } from './hexToRgb';
import { rgbToAnsi256 } from './rgbToAnsi256';

type TimeDeltaStyle = { bold: boolean; mutedColor: boolean };

const ansiColor = (color: string) =>
  applyPipe(
    color,
    hexToRgb,
    (value) => rgbToAnsi256(...value),
    (color) => `\u001B[38;5;${color}m`,
  );

const ansiDim = `\u001B[2m`;

const ansiDimItalic = `\u001B[2;3m`;

const ansiItalic = `\u001B[3m`;

const ansiBoldItalic = `\u001B[1;3m`;

const ansiClear = `\u001B[0m`;

const mutedTextColor = '#c0c0c0';

const getSeverityCaption = (severityLevel: SeverityLevel) =>
  severityLevel === SeverityLevel.debug
    ? 'DEBUG'
    : severityLevel === SeverityLevel.info
    ? 'INFO'
    : severityLevel === SeverityLevel.warn
    ? 'WARNING'
    : severityLevel === SeverityLevel.error
    ? 'ERROR'
    : asNever(severityLevel);

const getStyledTimeDelta = (
  timeDelta: number,
): [caption: string, style: TimeDeltaStyle] => [
  '+' + formatTime(timeDelta),
  applyPipe(Math.round(timeDelta), (value) => ({
    bold: value >= 1000,
    mutedColor: !(value >= 10),
  })),
];

const timeDeltaStyleToCss = ({ bold, mutedColor }: TimeDeltaStyle) =>
  [
    'font-style: italic',
    ...(bold ? ['font-weight: bold'] : []),
    ...(mutedColor ? [`color: ${mutedTextColor}`] : []),
  ].join('; ');

const tryToSerialize = ({
  data,
  maxLength = 4000,
}: {
  data: unknown;
  maxLength?: number;
}) => {
  try {
    const retval = JSON.stringify(data, null, ' ');
    if (retval.length > maxLength) {
      return retval.slice(0, maxLength) + '... [truncated]';
    } else {
      return retval;
    }
  } catch (e) {
    return data;
  }
};

const renderWithCssStyles = (
  data: readonly (readonly [text: string, style: string])[],
) => [
  applyPipe(data.map(([text]) => `%c${text}%c`)).join(''),
  ...applyPipe(
    data,
    flatMapIterable(([, style]) => [style, '']),
  ),
];

/**
 * @internal
 */
export const pureConsoleHandler = ({
  getImpureHandler,
  logStyle,
  maxLength,
}: {
  getImpureHandler: (
    severityLevel?: SeverityLevel,
  ) => (...data: unknown[]) => void;
  logStyle: LogStyle;
  maxLength?: number;
}) => ({
  severityLevel: nonNormalizedSeverityLevel,
  stackLevel,
  badges,
  timeDelta,
  data,
}: LogMessage): void => {
  const stackIndicator = applyPipe(
    rangeIterable(undefined, stackLevel),
    mapIterable(() => '\u00B7'),
  );
  const styledTimeDelta = getStyledTimeDelta(timeDelta);
  const severityLevel = normalizeSeverityLevel(nonNormalizedSeverityLevel);
  const log = getImpureHandler(severityLevel);
  if (logStyle === 'css') {
    log(
      ...renderWithCssStyles([
        ...applyPipe(
          zipIterables(firstIterable, [
            ...(severityLevel !== undefined
              ? [
                  [
                    getSeverityCaption(severityLevel),
                    `color: ${mutedTextColor}`,
                  ] as const,
                ]
              : []),
            ...applyPipe(
              stackIndicator,
              mapIterable(
                (caption) => [caption, `color: ${mutedTextColor}`] as const,
              ),
            ),
            ...applyPipe(
              badges,
              mapIterable(
                ({ caption, color }) =>
                  [
                    caption,
                    `background: ${color}; color: #ffffff; padding: 0 3px;`,
                  ] as const,
              ),
            ),
            applyPipe(
              styledTimeDelta,
              ([caption, style]) =>
                [caption, timeDeltaStyleToCss(style)] as const,
            ),
          ]),
          flatMapIterable(([isFirst, el]) => [
            ...(isFirst ? [] : [[' ', ''] as const]),
            el,
          ]),
        ),
      ]),
      ...data,
    );
  } else if (logStyle === 'ansi') {
    log(
      [
        ...(severityLevel !== undefined
          ? [
              `${
                severityLevel === SeverityLevel.warn
                  ? ansiColor(logPalette.yellow)
                  : severityLevel === SeverityLevel.error
                  ? ansiColor(logPalette.red)
                  : ansiDim
              }${getSeverityCaption(severityLevel)}${ansiClear}`,
            ]
          : []),
        ...applyPipe(
          stackIndicator,
          mapIterable((caption) => `${ansiDim}${caption}${ansiClear}`),
        ),
        ...applyPipe(
          badges,
          mapIterable(
            ({ caption, color }) =>
              `${ansiColor(color)}[${caption}]${ansiClear}`,
          ),
        ),
        `${applyPipe(
          styledTimeDelta,
          ([caption, { bold, mutedColor }]) =>
            `${
              bold ? ansiBoldItalic : mutedColor ? ansiDimItalic : ansiItalic
            }${caption}${ansiClear}`,
        )}`,
      ].join(' '),
      ...data,
    );
  } else if (logStyle === 'none') {
    log(
      `${[
        ...(severityLevel !== undefined
          ? [getSeverityCaption(severityLevel)]
          : []),
        ...stackIndicator,
        ...applyPipe(
          badges,
          mapIterable((value) => `[${value.captionNoColor ?? value.caption}]`),
        ),
        styledTimeDelta[0],
      ].join(' ')} ${data.length ? tryToSerialize({ data, maxLength }) : ''}`,
    );
  } else {
    asNever(logStyle);
  }
};
