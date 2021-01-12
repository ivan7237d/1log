import { applyPipe, asNever, mapIterable, rangeIterable } from 'antiutils';
import { LogMessage } from './logger/handler';
import { normalizeSeverityLevel } from './logger/normalizeSeverityLevel';
import { SeverityLevel } from './logger/severityLevel';
import { formatTime } from './plugin/consoleHandlerPlugin/pureConsoleHandler/formatTime';
import { isMessages } from './plugin/mockHandlerPlugin';

const formatMessageHeader = ({
  stackLevel,
  severityLevel,
  badges,
  timeDelta,
}: LogMessage) =>
  [
    ...applyPipe(severityLevel, normalizeSeverityLevel, (severityLevel) =>
      severityLevel === SeverityLevel.debug
        ? ['DEBUG']
        : severityLevel === SeverityLevel.info
        ? ['INFO']
        : severityLevel === SeverityLevel.warn
        ? ['WARNING']
        : severityLevel === SeverityLevel.error
        ? ['ERROR']
        : severityLevel === undefined
        ? []
        : asNever(severityLevel),
    ),
    ...applyPipe(
      rangeIterable(undefined, stackLevel),
      mapIterable(() => '·'),
    ),
    ...applyPipe(
      badges,
      mapIterable((badge) => `[${badge.captionNoColor ?? badge.caption}]`),
    ),
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
          applyPipe(
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
export const jestSerializer: import('pretty-format').NewPlugin = {
  test: isMessages,
  serialize: (val, config, indentation, depth, refs, printer) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const messages = val as LogMessage[];
    return messages.length === 0
      ? `[No log messages]`
      : ++depth > config.maxDepth
      ? `[Log messages]`
      : serializeItems(messages, config, indentation, depth, refs, printer);
  },
};
