import {
  consoleHandlerPlugin,
  functionPlugin,
  installPlugins,
  iterableIteratorPlugin,
  promisePlugin,
} from '../..';

installPlugins(
  consoleHandlerPlugin(),
  functionPlugin,
  promisePlugin,
  iterableIteratorPlugin,
);
