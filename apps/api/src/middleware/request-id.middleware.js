import { randomUUID } from "node:crypto";

/**
 * Adds a request ID to every request and mirrors it in the response header.
 *
 * @type {import("express").RequestHandler}
 */
export const requestIdMiddleware = (request, response, next) => {
  const requestId = request.header("x-request-id") ?? randomUUID();

  request.id = requestId;
  response.setHeader("x-request-id", requestId);

  next();
};
