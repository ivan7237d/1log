import { assertNever, pipe } from 'antiutils';
import { LogMessage } from './logger/handler';
import { normalizeSeverity } from './logger/normalizeSeverity';
import { Severity } from './logger/severity';
import { formatTime } from './plugin/consoleHandlerPlugin/pureConsoleHandler/formatTime';
import { isMessages } from './plugin/mockHandlerPlugin';

const formatMessageHeader = ({
  stackLevel,
  severity,
  badges,
  timeDelta,
}: LogMessage) =>
  [
    ...pipe(severity, normalizeSeverity, (severity) =>
      severity === Severity.debug
        ? ['DEBUG']
        : severity === Severity.info
        ? ['INFO']
        : severity === Severity.warn
        ? ['WARNING']
        : severity === Severity.error
        ? ['ERROR']
        : severity === undefined
        ? []
        : assertNever(severity),
    ),
    ...Array(stackLevel).fill('·'),
    ...badges.map((badge) => `[${badge.captionNoColor ?? badge.caption}]`),
    '+' + formatTime(timeDelta),
  ].join(' ');

const serializeItems: import('pretty-format').NewPlugin['serialize'] = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer,
) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const messages = val as LogMessage[];
  const indentationItems = indentation + config.indent;
  return (
    messages
      .map(
        (message) =>
          indentation +
          formatMessageHeader(message) +
          pipe(
            message.data.map((value) =>
              printer(value, config, indentationItems, depth, refs),
            ),
            (values) =>
              values.some((value) => value.includes('\n'))
                ? config.spacingOuter +
                  values
                    .map((value) => indentationItems + value)
                    .join(config.spacingInner) +
                  indentation
                : values.map((value) => ' ' + value).join(''),
          ),
      )
      .join(config.spacingInner) + indentation
  );
};

/**
 * A Jest serializer plugin that formats log messages.
 */
export const jestMessagesSerializer: import('pretty-format').NewPlugin = {
  test: isMessages,
  serialize: (val, config, indentation, depth, refs, printer) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const messages = val as LogMessage[];
    return messages.length === 0
      ? `[No log messages]`
      : depth > 0
      ? `[Log messages]`
      : serializeItems(messages, config, indentation, depth, refs, printer);
  },
};
