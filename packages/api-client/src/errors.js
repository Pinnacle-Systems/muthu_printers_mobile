/**
 * Error thrown by the API client for network, timeout, API, and parsing failures.
 */
export class ApiClientError extends Error {
  /**
   * @param {string} message
   * @param {{ code: string, statusCode?: number, details?: unknown, cause?: unknown }} options
   */
  constructor(message, { code, statusCode, details, cause } = {}) {
    super(message, { cause });

    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
