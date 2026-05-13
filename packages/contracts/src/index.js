/**
 * @typedef {"admin" | "manager" | "staff" | "customer"} UserRole
 */

/**
 * Runtime-safe user role constants shared across apps and packages.
 */
export const UserRoles = Object.freeze({
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  CUSTOMER: "customer"
});

/**
 * @template T
 * @typedef {{ success: true, data: T, meta?: Record<string, unknown> }} SuccessResponse
 */

/**
 * @typedef {{ code?: string, message: string, details?: unknown }} ErrorLike
 */

/**
 * @typedef {{ success: false, error: { code: string, message: string, details?: unknown } }} ErrorResponse
 */

/**
 * Creates a consistent success response envelope.
 *
 * @template T
 * @param {T} data
 * @param {Record<string, unknown>} [meta]
 * @returns {SuccessResponse<T>}
 */
export const createSuccessResponse = (data, meta) => {
  return meta === undefined
    ? {
        success: true,
        data
      }
    : {
        success: true,
        data,
        meta
      };
};

/**
 * Creates a consistent error response envelope.
 *
 * @param {ErrorLike | Error} error
 * @returns {ErrorResponse}
 */
export const createErrorResponse = (error) => {
  return {
    success: false,
    error: {
      code: "code" in error && typeof error.code === "string" ? error.code : "ERROR",
      message: error.message,
      details: "details" in error ? error.details : undefined
    }
  };
};
