import {
  asyncIterablePlugin,
  consoleHandlerPlugin,
  functionPlugin,
  installPlugins,
  iterablePlugin,
  promisePlugin,
} from '../..';

installPlugins(
  consoleHandlerPlugin(),
  functionPlugin,
  promisePlugin,
  iterablePlugin,
  asyncIterablePlugin,
);
