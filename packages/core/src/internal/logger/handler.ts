export interface LogBadge {
  caption: string;
  /**
   * Must be in non-shorthand hex format, e.g. `#ffffff`.
   */
  color: string;
  /**
   * Caption to use when colors cannot be displayed.
   */
  captionNoColor?: string;
}

export interface LogMessage {
  severity?: number;
  stackLevel: number;
  badges: LogBadge[];
  timeDelta: number;
  data: unknown[];
}

export interface LogHandler {
  (message: LogMessage): void;
}
