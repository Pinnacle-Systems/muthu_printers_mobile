import { expect, test } from "vitest";
import { ValidationError } from "@repo/errors";
import { validateBody, validateParams, validateQuery, z } from "./index.js";

const response = {};

const createNext = () => {
  const calls = [];
  const next = (error) => {
    calls.push(error);
  };

  return {
    calls,
    next
  };
};

void test("validateBody replaces request body with parsed data", () => {
  const request = {
    body: {
      count: "2"
    }
  };
  const { calls, next } = createNext();
  const middleware = validateBody(
    z.object({
      count: z.coerce.number()
    })
  );

  middleware(request, response, next);

  expect(request.body).toEqual({
    count: 2
  });
  expect(calls).toEqual([undefined]);
});

void test("validateQuery replaces request query with parsed data", () => {
  const request = {
    query: {
      page: "3"
    }
  };
  const { calls, next } = createNext();
  const middleware = validateQuery(
    z.object({
      page: z.coerce.number()
    })
  );

  middleware(request, response, next);

  expect(request.query).toEqual({
    page: 3
  });
  expect(calls).toEqual([undefined]);
});

void test("validateParams replaces request params with parsed data", () => {
  const request = {
    params: {
      id: "order_123"
    }
  };
  const { calls, next } = createNext();
  const middleware = validateParams(
    z.object({
      id: z.string().min(1)
    })
  );

  middleware(request, response, next);

  expect(request.params).toEqual({
    id: "order_123"
  });
  expect(calls).toEqual([undefined]);
});

void test("validation failures become shared ValidationError instances", () => {
  const request = {
    body: {
      message: ""
    }
  };
  const { calls, next } = createNext();
  const middleware = validateBody(
    z.object({
      message: z.string().min(1)
    })
  );

  middleware(request, response, next);

  expect(calls).toHaveLength(1);
  expect(calls[0]).toBeInstanceOf(ValidationError);

  const error = calls[0];

  expect(error.code).toBe("VALIDATION_ERROR");
  expect(error.statusCode).toBe(400);
  expect(error.details).toEqual([
    {
      code: "too_small",
      message: "String must contain at least 1 character(s)",
      path: "message"
    }
  ]);
});
