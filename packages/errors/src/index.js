/**
 * Base application error with a stable machine-readable code and HTTP status.
 */
export class AppError extends Error {
  /**
   * @param {{ code: string, message: string, statusCode: number, details?: unknown }} options
   */
  constructor({ code, message, statusCode, details }) {
    super(message);

    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error for invalid request input.
 */
export class ValidationError extends AppError {
  /**
   * @param {{ code?: string, details?: unknown, message?: string }} [options]
   */
  constructor(options = {}) {
    super({
      code: options.code ?? "VALIDATION_ERROR",
      message: options.message ?? "Validation failed",
      statusCode: 400,
      details: options.details
    });
  }
}

/**
 * Error for missing or invalid authentication.
 */
export class AuthError extends AppError {
  /**
   * @param {{ code?: string, details?: unknown, message?: string }} [options]
   */
  constructor(options = {}) {
    super({
      code: options.code ?? "AUTH_ERROR",
      message: options.message ?? "Authentication required",
      statusCode: 401,
      details: options.details
    });
  }
}

/**
 * Error for authenticated users without access to a resource.
 */
export class ForbiddenError extends AppError {
  /**
   * @param {{ code?: string, details?: unknown, message?: string }} [options]
   */
  constructor(options = {}) {
    super({
      code: options.code ?? "FORBIDDEN",
      message: options.message ?? "Forbidden",
      statusCode: 403,
      details: options.details
    });
  }
}

/**
 * Error for resources that do not exist.
 */
export class NotFoundError extends AppError {
  /**
   * @param {{ code?: string, details?: unknown, message?: string }} [options]
   */
  constructor(options = {}) {
    super({
      code: options.code ?? "NOT_FOUND",
      message: options.message ?? "Not found",
      statusCode: 404,
      details: options.details
    });
  }
}

/**
 * Error for resource state conflicts.
 */
export class ConflictError extends AppError {
  /**
   * @param {{ code?: string, details?: unknown, message?: string }} [options]
   */
  constructor(options = {}) {
    super({
      code: options.code ?? "CONFLICT",
      message: options.message ?? "Conflict",
      statusCode: 409,
      details: options.details
    });
  }
}

/**
 * Error for upstream or third-party service failures.
 */
export class ExternalServiceError extends AppError {
  /**
   * @param {{ code?: string, details?: unknown, message?: string }} [options]
   */
  constructor(options = {}) {
    super({
      code: options.code ?? "EXTERNAL_SERVICE_ERROR",
      message: options.message ?? "External service error",
      statusCode: 502,
      details: options.details
    });
  }
}

/**
 * @param {unknown} error
 * @returns {error is AppError}
 */
export const isAppError = (error) => {
  return error instanceof AppError;
};
