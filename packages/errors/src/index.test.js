import { expect, test } from "vitest";
import {
  AppError,
  AuthError,
  ConflictError,
  ExternalServiceError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  isAppError
} from "./index.js";

const details = {
  field: "email"
};

void test("AppError stores code, message, statusCode, and details", () => {
  const error = new AppError({
    code: "APP_ERROR",
    message: "Something failed",
    statusCode: 500,
    details
  });

  expect(error.name).toBe("AppError");
  expect(error.code).toBe("APP_ERROR");
  expect(error.message).toBe("Something failed");
  expect(error.statusCode).toBe(500);
  expect(error.details).toBe(details);
  expect(error).toBeInstanceOf(Error);
  expect(error).toBeInstanceOf(AppError);
});

void test("ValidationError uses validation defaults", () => {
  const error = new ValidationError({ details });

  expect(error.code).toBe("VALIDATION_ERROR");
  expect(error.message).toBe("Validation failed");
  expect(error.statusCode).toBe(400);
  expect(error.details).toBe(details);
  expect(error).toBeInstanceOf(AppError);
});

void test("AuthError uses auth defaults", () => {
  const error = new AuthError();

  expect(error.code).toBe("AUTH_ERROR");
  expect(error.message).toBe("Authentication required");
  expect(error.statusCode).toBe(401);
  expect(error).toBeInstanceOf(AppError);
});

void test("ForbiddenError uses forbidden defaults", () => {
  const error = new ForbiddenError();

  expect(error.code).toBe("FORBIDDEN");
  expect(error.message).toBe("Forbidden");
  expect(error.statusCode).toBe(403);
  expect(error).toBeInstanceOf(AppError);
});

void test("NotFoundError uses not-found defaults", () => {
  const error = new NotFoundError({ message: "Order not found" });

  expect(error.code).toBe("NOT_FOUND");
  expect(error.message).toBe("Order not found");
  expect(error.statusCode).toBe(404);
  expect(error).toBeInstanceOf(AppError);
});

void test("ConflictError uses conflict defaults", () => {
  const error = new ConflictError();

  expect(error.code).toBe("CONFLICT");
  expect(error.message).toBe("Conflict");
  expect(error.statusCode).toBe(409);
  expect(error).toBeInstanceOf(AppError);
});

void test("ExternalServiceError uses external-service defaults", () => {
  const error = new ExternalServiceError();

  expect(error.code).toBe("EXTERNAL_SERVICE_ERROR");
  expect(error.message).toBe("External service error");
  expect(error.statusCode).toBe(502);
  expect(error).toBeInstanceOf(AppError);
});

void test("specific errors accept custom code, message, and details", () => {
  const error = new ValidationError({
    code: "INVALID_INPUT",
    message: "Invalid input",
    details
  });

  expect(error.code).toBe("INVALID_INPUT");
  expect(error.message).toBe("Invalid input");
  expect(error.statusCode).toBe(400);
  expect(error.details).toBe(details);
});

void test("isAppError identifies AppError instances", () => {
  expect(isAppError(new AppError({ code: "APP", message: "App", statusCode: 500 }))).toBe(true);
  expect(isAppError(new NotFoundError())).toBe(true);
  expect(isAppError(new Error("Nope"))).toBe(false);
  expect(isAppError("Nope")).toBe(false);
});
