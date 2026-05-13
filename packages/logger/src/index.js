const SENSITIVE_KEY_PARTS = ["token", "password", "authorization", "otp", "secret", "credential"];
const REDACTED_VALUE = "[REDACTED]";

/**
 * @typedef {"debug" | "info" | "warn" | "error"} LogLevel
 * @typedef {Record<string, unknown>} LogMetadata
 * @typedef {{ context?: LogMetadata, environment?: string }} LoggerOptions
 * @typedef {{
 *   debug: (message: string, metadata?: LogMetadata) => void,
 *   info: (message: string, metadata?: LogMetadata) => void,
 *   warn: (message: string, metadata?: LogMetadata) => void,
 *   error: (message: string, metadata?: LogMetadata) => void
 * }} Logger
 */

/**
 * @param {unknown} value
 * @returns {value is LogMetadata}
 */
const isPlainObject = (value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
};

/**
 * @param {string} key
 */
const isSensitiveKey = (key) => {
  const normalizedKey = key.toLowerCase();

  return SENSITIVE_KEY_PARTS.some((part) => normalizedKey.includes(part));
};

/**
 * Recursively redacts sensitive metadata values before logging.
 *
 * @param {unknown} metadata
 * @returns {unknown}
 */
export const sanitizeMetadata = (metadata) => {
  if (Array.isArray(metadata)) {
    return metadata.map((item) => sanitizeMetadata(item));
  }

  if (!isPlainObject(metadata)) {
    return metadata;
  }

  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [
      key,
      isSensitiveKey(key) ? REDACTED_VALUE : sanitizeMetadata(value)
    ])
  );
};

/**
 * @param {LogMetadata} metadata
 * @returns {LogMetadata}
 */
const sanitizeLogMetadata = (metadata) => {
  const sanitized = sanitizeMetadata(metadata);

  return isPlainObject(sanitized) ? sanitized : {};
};

/**
 * Creates an environment-aware logger. Development logs go to console methods;
 * production logs are emitted as structured JSON.
 *
 * @param {LoggerOptions} [options]
 * @returns {Logger}
 */
export const createLogger = (options = {}) => {
  const environment = options.environment ?? process.env.NODE_ENV ?? "development";
  const baseContext = options.context ?? {};

  /**
   * @param {LogLevel} level
   * @param {string} message
   * @param {LogMetadata} [metadata]
   */
  const write = (level, message, metadata = {}) => {
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...sanitizeLogMetadata(baseContext),
      ...sanitizeLogMetadata(metadata)
    };

    if (environment === "production") {
      console.log(JSON.stringify(payload));
      return;
    }

    console[level](message, payload);
  };

  return {
    debug: (message, metadata) => write("debug", message, metadata),
    info: (message, metadata) => write("info", message, metadata),
    warn: (message, metadata) => write("warn", message, metadata),
    error: (message, metadata) => write("error", message, metadata)
  };
};
