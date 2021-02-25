import { applyPipe, asNever } from 'antiutils';
import { LogMessage } from '../../logger/handler';
import { HandlerPlugin, pluginSymbol, PluginType } from '../../logger/plugin';
import { Severity } from '../../logger/severity';
import { detectedLogStyle } from './detectedLogStyle';
import { pureConsoleHandler } from './pureConsoleHandler/pch';

// This works around the problem that React overwrites console methods in dev
// mode during test renders, leading to confusing badge numbers.
const consoleSnapshot = applyPipe(
  console,
  ({ debug, info, warn, error, log }) => ({ debug, info, warn, error, log }),
);

/**
 * A plugin that writes log messages to the console. Can optionally be passed a
 * predicate to mute messages for which the predicate returns false.
 */
export const consoleHandlerPlugin = (
  filter?: (message: LogMessage) => boolean,
): HandlerPlugin => ({
  [pluginSymbol]: PluginType.Handler,
  handler: applyPipe(
    pureConsoleHandler({
      getImpureHandler: (severity) =>
        severity === Severity.debug
          ? consoleSnapshot.debug
          : severity === Severity.info
          ? consoleSnapshot.info
          : severity === Severity.warn
          ? consoleSnapshot.warn
          : severity === Severity.error
          ? consoleSnapshot.error
          : severity === undefined
          ? consoleSnapshot.log
          : asNever(severity),
      logStyle: detectedLogStyle,
      maxLength: 4000,
    }),
    (handler) =>
      filter
        ? (message) => {
            if (filter(message)) {
              handler(message);
            }
          }
        : handler,
  ),
});
