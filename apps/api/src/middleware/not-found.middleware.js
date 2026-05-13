import { NotFoundError } from "@repo/errors";

/**
 * @type {import("express").RequestHandler}
 */
export const notFoundMiddleware = (request, _response, next) => {
  next(
    new NotFoundError({
      message: `Route not found: ${request.method} ${request.originalUrl}`
    })
  );
};
