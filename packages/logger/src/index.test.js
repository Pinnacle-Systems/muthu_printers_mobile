import { afterEach, expect, test, vi } from "vitest";
import { createLogger, sanitizeMetadata } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

void test("sanitizeMetadata redacts sensitive keys case-insensitively", () => {
  const sanitized = sanitizeMetadata({
    token: "abc",
    Password: "pw",
    AUTHORIZATION: "Bearer abc",
    otp: "123456",
    clientSecret: "secret",
    apiCredential: "credential",
    safe: "visible"
  });

  expect(sanitized).toEqual({
    token: "[REDACTED]",
    Password: "[REDACTED]",
    AUTHORIZATION: "[REDACTED]",
    otp: "[REDACTED]",
    clientSecret: "[REDACTED]",
    apiCredential: "[REDACTED]",
    safe: "visible"
  });
});

void test("sanitizeMetadata redacts nested objects and arrays", () => {
  const sanitized = sanitizeMetadata({
    user: {
      name: "Asha",
      password: "pw"
    },
    attempts: [
      {
        otp: "123456",
        channel: "sms"
      }
    ]
  });

  expect(sanitized).toEqual({
    user: {
      name: "Asha",
      password: "[REDACTED]"
    },
    attempts: [
      {
        otp: "[REDACTED]",
        channel: "sms"
      }
    ]
  });
});

void test("createLogger sanitizes context and per-call metadata in production JSON logs", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const logger = createLogger({
    context: {
      service: "api",
      token: "context-token"
    },
    environment: "production"
  });

  logger.info("request handled", {
    password: "pw",
    requestId: "req_123"
  });

  expect(log).toHaveBeenCalledTimes(1);

  const payload = JSON.parse(String(log.mock.calls[0]?.[0] ?? "{}"));

  expect(payload.level).toBe("info");
  expect(payload.message).toBe("request handled");
  expect(payload.service).toBe("api");
  expect(payload.token).toBe("[REDACTED]");
  expect(payload.password).toBe("[REDACTED]");
  expect(payload.requestId).toBe("req_123");
});
