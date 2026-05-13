import { ValidationError } from "@repo/errors";
import { z } from "zod";

export { z };

/**
 * @param {import("zod").ZodError} error
 */
const formatZodError = (error) => {
  return error.issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.join(".")
  }));
};

/**
 * @param {"body" | "query" | "params"} location
 * @param {import("zod").ZodType<unknown>} schema
 * @returns {import("express").RequestHandler}
 */
const validateRequestLocation = (location, schema) => {
  return (request, _response, next) => {
    const result = schema.safeParse(request[location]);

    if (!result.success) {
      next(
        new ValidationError({
          details: formatZodError(result.error)
        })
      );
      return;
    }

    request[location] = result.data;
    next();
  };
};

/**
 * Validates and replaces `request.body` with parsed zod data.
 *
 * @param {import("zod").ZodType<unknown>} schema
 * @returns {import("express").RequestHandler}
 */
export const validateBody = (schema) => {
  return validateRequestLocation("body", schema);
};

/**
 * Validates and replaces `request.query` with parsed zod data.
 *
 * @param {import("zod").ZodType<unknown>} schema
 * @returns {import("express").RequestHandler}
 */
export const validateQuery = (schema) => {
  return validateRequestLocation("query", schema);
};

/**
 * Validates and replaces `request.params` with parsed zod data.
 *
 * @param {import("zod").ZodType<unknown>} schema
 * @returns {import("express").RequestHandler}
 */
export const validateParams = (schema) => {
  return validateRequestLocation("params", schema);
};
