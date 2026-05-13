import { isAppError } from "@repo/errors";
import { createLogger } from "@repo/logger";

const logger = createLogger({
  context: {
    service: "api"
  }
});

/**
 * Centralized Express error handler.
 *
 * @type {import("express").ErrorRequestHandler}
 */
export const errorMiddleware = (
  error,
  request,
  response,
  _next
) => {
  const statusCode = isAppError(error) ? error.statusCode : 500;
  const code = isAppError(error) ? error.code : "INTERNAL_SERVER_ERROR";
  const message = error instanceof Error ? error.message : "Internal server error";
  const details = isAppError(error) ? error.details : undefined;

  logger.error("Request failed", {
    code,
    details,
    method: request.method,
    path: request.originalUrl,
    requestId: request.id,
    stack: error instanceof Error ? error.stack : undefined,
    statusCode
  });

  response.status(statusCode).json({
    error: {
      code,
      message,
      details,
      requestId: request.id
    }
  });
};
